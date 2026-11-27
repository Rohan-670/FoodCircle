const { prisma } = require('../config/database');
const {
  DEFAULT_MATCHING_WEIGHTS,
  MATCHING_THRESHOLDS,
} = require('../config/matchingWeights');
const AppError = require('../utils/AppError');

const ACTIVE_DONATION_STATUSES = ['AVAILABLE', 'REQUESTED'];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function normalizeWeights(customWeights = {}) {
  const merged = { ...DEFAULT_MATCHING_WEIGHTS, ...customWeights };
  const sum =
    merged.distance +
    merged.foodCategory +
    merged.quantity +
    merged.urgency +
    merged.capacity;

  if (sum <= 0) {
    throw new AppError('Matching weights must sum to a positive value.', 400);
  }

  return {
    distance: merged.distance / sum,
    foodCategory: merged.foodCategory / sum,
    quantity: merged.quantity / sum,
    urgency: merged.urgency / sum,
    capacity: merged.capacity / sum,
  };
}

function getUrgencyDetails(expiresAt, now = new Date()) {
  const hoursRemaining = Math.max(
    0,
    (new Date(expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60)
  );

  if (hoursRemaining <= MATCHING_THRESHOLDS.criticalUrgencyHours) {
    return { level: 'CRITICAL', score: 100, hoursRemaining };
  }
  if (hoursRemaining <= MATCHING_THRESHOLDS.highUrgencyHours) {
    return { level: 'HIGH', score: 80, hoursRemaining };
  }
  if (hoursRemaining <= MATCHING_THRESHOLDS.mediumUrgencyHours) {
    return { level: 'MEDIUM', score: 60, hoursRemaining };
  }
  return { level: 'LOW', score: 40, hoursRemaining };
}

/**
 * Pure, deterministic suitability scoring function for a (Donation, NGOProfile) pair.
 * Does not call any external AI APIs or invent missing NGO requirements.
 */
function calculateMatchScore(
  donation,
  ngo,
  customWeights = DEFAULT_MATCHING_WEIGHTS,
  now = new Date()
) {
  const weights = normalizeWeights(customWeights);
  const reasons = [];

  const isNgoActive = ngo.user ? ngo.user.isActive : true;
  const isNgoVerified = Boolean(ngo.isVerified);

  if (!isNgoActive || !isNgoVerified) {
    return {
      eligible: false,
      totalScore: 0,
      distanceKm: null,
      urgency: getUrgencyDetails(donation.expiresAt, now),
      breakdown: {
        distance: 0,
        foodCategory: 0,
        quantity: 0,
        urgency: 0,
        capacity: 0,
      },
      weights,
      reasons: [
        !isNgoVerified
          ? 'NGO is not yet verified by an administrator'
          : 'NGO account is currently deactivated',
      ],
    };
  }

  // 1. Distance & Service Area Suitability
  let distanceKm = null;
  let distanceScore = 0;

  const hasCoords =
    donation.latitude != null &&
    donation.longitude != null &&
    ngo.latitude != null &&
    ngo.longitude != null;

  const addressText = (donation.pickupAddress || '').toLowerCase();
  const serviceAreaText = (ngo.serviceArea || '').toLowerCase().trim();
  const serviceAreaMatches =
    Boolean(serviceAreaText) &&
    (addressText.includes(serviceAreaText) ||
      serviceAreaText
        .split(/[\s,]+/)
        .some((token) => token.length > 2 && addressText.includes(token)));

  if (hasCoords) {
    distanceKm = Number(
      calculateDistanceKm(
        donation.latitude,
        donation.longitude,
        ngo.latitude,
        ngo.longitude
      ).toFixed(2)
    );
    distanceScore = Math.max(
      0,
      Math.round((1 - distanceKm / MATCHING_THRESHOLDS.maxDistanceKm) * 100)
    );
    reasons.push(`Distance between donor and NGO is ${distanceKm} km`);
    if (serviceAreaMatches) {
      reasons.push(`Pickup location matches NGO service area (${ngo.serviceArea})`);
    }
  } else if (serviceAreaMatches) {
    distanceScore = 70;
    reasons.push(
      `Coordinates unavailable; pickup address matches NGO service area (${ngo.serviceArea})`
    );
  } else {
    distanceScore = 40;
    reasons.push('Coordinates unavailable; exact distance could not be calculated');
  }

  // 2. Food Category Match
  let categoryScore = 50;
  const preferredCategories = Array.isArray(ngo.preferredCategories)
    ? ngo.preferredCategories
    : [];

  if (preferredCategories.length > 0) {
    const donationCat = (donation.foodCategory || '').toLowerCase();
    const matched = preferredCategories.some(
      (cat) =>
        cat.toLowerCase() === donationCat ||
        donationCat.includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(donationCat)
    );
    if (matched) {
      categoryScore = 100;
      reasons.push(`Matches NGO preferred category (${donation.foodCategory})`);
    } else {
      categoryScore = 20;
      reasons.push(
        `Category "${donation.foodCategory}" is outside NGO preferred categories`
      );
    }
  } else {
    reasons.push('NGO has not specified preferred food categories (neutral score)');
  }

  // 3. Quantity Match vs. Current Requirements
  let quantityScore = 50;
  const targetQuantity = ngo.requiredQuantity;

  if (targetQuantity && targetQuantity > 0) {
    const coverageRatio = Math.min(1, donation.quantity / targetQuantity);
    quantityScore = Math.round(coverageRatio * 100);
    reasons.push(
      `Donation (${donation.quantity} ${donation.unit}) covers ${quantityScore}% of NGO's ${targetQuantity}-unit requirement`
    );
  } else {
    reasons.push('NGO has not specified a current quantity requirement (neutral score)');
  }

  // 4. Donation Urgency & Expiry Deadline
  const urgency = getUrgencyDetails(donation.expiresAt, now);
  const urgencyScore = urgency.score;
  reasons.push(
    `Urgency is ${urgency.level} (${urgency.hoursRemaining.toFixed(1)}h until expiry)`
  );

  // 5. NGO Capacity
  let capacityScore = 50;
  if (ngo.capacity && ngo.capacity > 0) {
    if (ngo.capacity >= donation.quantity) {
      capacityScore = 100;
      reasons.push(
        `NGO capacity (${ngo.capacity}) accommodates full donation (${donation.quantity})`
      );
    } else {
      capacityScore = Math.max(
        10,
        Math.round((ngo.capacity / donation.quantity) * 100)
      );
      reasons.push(
        `NGO capacity (${ngo.capacity}) is smaller than donation (${donation.quantity})`
      );
    }
  } else {
    reasons.push('NGO capacity not specified (neutral score)');
  }

  const totalScore = Math.round(
    distanceScore * weights.distance +
      categoryScore * weights.foodCategory +
      quantityScore * weights.quantity +
      urgencyScore * weights.urgency +
      capacityScore * weights.capacity
  );

  return {
    eligible: true,
    totalScore,
    distanceKm,
    urgency: {
      level: urgency.level,
      hoursRemaining: Number(urgency.hoursRemaining.toFixed(1)),
    },
    breakdown: {
      distance: distanceScore,
      foodCategory: categoryScore,
      quantity: quantityScore,
      urgency: urgencyScore,
      capacity: capacityScore,
    },
    weights,
    reasons,
  };
}

/**
 * Recommend suitable verified & active NGOs for a specific donor's donation.
 */
async function getRecommendedNgosForDonation(userId, donationId, filters = {}) {
  const donorProfile = await prisma.donorProfile.findUnique({ where: { userId } });
  if (!donorProfile) {
    throw new AppError('Donor profile not found.', 404);
  }

  const donation = await prisma.donation.findUnique({ where: { id: donationId } });
  if (!donation) {
    throw new AppError('Donation not found.', 404);
  }

  if (donation.donorId !== donorProfile.id) {
    throw new AppError(
      'You do not have permission to view recommendations for this donation.',
      403
    );
  }

  const ngos = await prisma.nGOProfile.findMany({
    where: {
      isVerified: true,
      user: { isActive: true },
    },
    include: {
      user: { select: { id: true, isActive: true, email: true, phone: true } },
    },
  });

  const feedbacks = await prisma.recommendationFeedback.findMany({
    where: { userId, donationId },
  });
  const feedbackMap = new Map(feedbacks.map((f) => [f.ngoId, f.action]));

  const existingRequests = await prisma.donationRequest.findMany({
    where: { donationId },
    select: { id: true, ngoId: true, status: true },
  });
  const requestMap = new Map(existingRequests.map((r) => [r.ngoId, r]));

  const now = new Date();
  let recommendations = ngos
    .map((ngo) => {
      const match = calculateMatchScore(donation, ngo, DEFAULT_MATCHING_WEIGHTS, now);
      const userAction = feedbackMap.get(ngo.id) || null;
      const existingRequest = requestMap.get(ngo.id) || null;

      return {
        ngo: {
          id: ngo.id,
          organizationName: ngo.organizationName,
          contactPerson: ngo.contactPerson,
          serviceArea: ngo.serviceArea,
          capacity: ngo.capacity,
          preferredCategories: ngo.preferredCategories,
          requiredQuantity: ngo.requiredQuantity,
          currentRequirements: ngo.currentRequirements,
          isVerified: ngo.isVerified,
        },
        donationId: donation.id,
        ...match,
        userAction,
        existingRequest,
      };
    })
    .filter((rec) => rec.eligible)
    .filter((rec) => filters.includeIgnored || rec.userAction !== 'IGNORED');

  if (filters.minScore !== undefined) {
    recommendations = recommendations.filter(
      (rec) => rec.totalScore >= filters.minScore
    );
  }
  if (filters.maxDistanceKm !== undefined) {
    recommendations = recommendations.filter(
      (rec) => rec.distanceKm === null || rec.distanceKm <= filters.maxDistanceKm
    );
  }
  if (filters.serviceArea) {
    const query = filters.serviceArea.toLowerCase();
    recommendations = recommendations.filter((rec) =>
      rec.ngo.serviceArea.toLowerCase().includes(query)
    );
  }

  recommendations.sort((a, b) => b.totalScore - a.totalScore);

  return {
    donation: {
      id: donation.id,
      title: donation.title,
      foodCategory: donation.foodCategory,
      quantity: donation.quantity,
      unit: donation.unit,
      status: donation.status,
      expiresAt: donation.expiresAt,
    },
    weights: DEFAULT_MATCHING_WEIGHTS,
    recommendations,
  };
}

/**
 * Recommend suitable active donations for the authenticated NGO.
 */
async function getRecommendedDonationsForNgo(userId, filters = {}) {
  const ngoProfile = await prisma.nGOProfile.findUnique({
    where: { userId },
    include: { user: { select: { id: true, isActive: true } } },
  });

  if (!ngoProfile) {
    throw new AppError('NGO profile not found.', 404);
  }

  if (!ngoProfile.isVerified) {
    return {
      ngoVerified: false,
      notice:
        'Your NGO account is pending administrator verification. Verified NGOs receive full donation recommendations.',
      weights: DEFAULT_MATCHING_WEIGHTS,
      recommendations: [],
    };
  }

  const now = new Date();
  const donations = await prisma.donation.findMany({
    where: {
      status: { in: ACTIVE_DONATION_STATUSES },
      expiresAt: { gt: now },
    },
    include: {
      donor: { select: { id: true, organizationName: true, businessType: true } },
    },
  });

  const feedbacks = await prisma.recommendationFeedback.findMany({
    where: { userId, ngoId: ngoProfile.id },
  });
  const feedbackMap = new Map(feedbacks.map((f) => [f.donationId, f.action]));

  const existingRequests = await prisma.donationRequest.findMany({
    where: { ngoId: ngoProfile.id },
    select: { id: true, donationId: true, status: true },
  });
  const requestMap = new Map(existingRequests.map((r) => [r.donationId, r]));

  let recommendations = donations
    .map((donation) => {
      const match = calculateMatchScore(
        donation,
        ngoProfile,
        DEFAULT_MATCHING_WEIGHTS,
        now
      );
      const userAction = feedbackMap.get(donation.id) || null;
      const existingRequest = requestMap.get(donation.id) || null;

      return {
        donation: {
          id: donation.id,
          title: donation.title,
          foodCategory: donation.foodCategory,
          quantity: donation.quantity,
          unit: donation.unit,
          pickupAddress: donation.pickupAddress,
          expiresAt: donation.expiresAt,
          status: donation.status,
          donor: donation.donor,
        },
        ngoId: ngoProfile.id,
        ...match,
        userAction,
        existingRequest,
      };
    })
    .filter((rec) => rec.eligible)
    .filter((rec) => filters.includeIgnored || rec.userAction !== 'IGNORED');

  if (filters.minScore !== undefined) {
    recommendations = recommendations.filter(
      (rec) => rec.totalScore >= filters.minScore
    );
  }
  if (filters.maxDistanceKm !== undefined) {
    recommendations = recommendations.filter(
      (rec) => rec.distanceKm === null || rec.distanceKm <= filters.maxDistanceKm
    );
  }
  if (filters.foodCategory) {
    const query = filters.foodCategory.toLowerCase();
    recommendations = recommendations.filter((rec) =>
      rec.donation.foodCategory.toLowerCase().includes(query)
    );
  }
  if (filters.urgency && filters.urgency !== 'ALL') {
    recommendations = recommendations.filter(
      (rec) => rec.urgency.level === filters.urgency
    );
  }

  recommendations.sort((a, b) => b.totalScore - a.totalScore);

  return {
    ngoVerified: true,
    weights: DEFAULT_MATCHING_WEIGHTS,
    recommendations,
  };
}

/**
 * Record user feedback (ACCEPT or IGNORE) on a recommendation.
 * Accepting a recommendation does NOT auto-accept a donation; it initiates a
 * standard request (for NGO) or sends an invitation notification (for Donor).
 */
async function recordRecommendationAction(userId, role, { donationId, ngoId, action }) {
  const feedbackAction = action === 'ACCEPT' ? 'ACCEPTED' : 'IGNORED';

  const feedback = await prisma.recommendationFeedback.upsert({
    where: {
      userId_donationId_ngoId: {
        userId,
        donationId,
        ngoId,
      },
    },
    update: { action: feedbackAction },
    create: {
      userId,
      donationId,
      ngoId,
      action: feedbackAction,
    },
  });

  if (feedbackAction === 'IGNORED') {
    return { feedback, resultType: 'IGNORED' };
  }

  // If NGO accepts a recommendation, create a PENDING DonationRequest (never auto-accepts donation)
  if (role === 'NGO') {
    const ngoProfile = await prisma.nGOProfile.findUnique({ where: { userId } });
    if (!ngoProfile || ngoProfile.id !== ngoId) {
      throw new AppError('NGO profile mismatch.', 403);
    }

    const existing = await prisma.donationRequest.findUnique({
      where: { donationId_ngoId: { donationId, ngoId } },
    });

    if (existing) {
      return { feedback, resultType: 'REQUEST_EXISTS', request: existing };
    }

    const donation = await prisma.donation.findUnique({ where: { id: donationId } });
    if (!donation || !ACTIVE_DONATION_STATUSES.includes(donation.status)) {
      throw new AppError('Donation is no longer available to request.', 400);
    }

    const createdRequest = await prisma.$transaction(async (tx) => {
      const reqRecord = await tx.donationRequest.create({
        data: {
          donationId,
          ngoId,
          requestedQuantity: donation.quantity,
          notes: 'Requested via suitability recommendation',
          status: 'PENDING',
        },
      });
      if (donation.status === 'AVAILABLE') {
        await tx.donation.update({
          where: { id: donationId },
          data: { status: 'REQUESTED' },
        });
      }
      return reqRecord;
    });

    return { feedback, resultType: 'REQUEST_CREATED', request: createdRequest };
  }

  // If Donor accepts a recommendation, send an invitation notification to the NGO
  if (role === 'DONOR') {
    const ngo = await prisma.nGOProfile.findUnique({ where: { id: ngoId } });
    const donation = await prisma.donation.findUnique({ where: { id: donationId } });
    if (!ngo || !donation) {
      throw new AppError('Donation or NGO not found.', 404);
    }

    const notification = await prisma.notification.create({
      data: {
        userId: ngo.userId,
        type: 'RECOMMENDATION_INVITE',
        title: 'Recommended Donation Invitation',
        message: `A donor invited your NGO to review "${donation.title}" (${donation.quantity} ${donation.unit}).`,
      },
    });

    return { feedback, resultType: 'INVITE_SENT', notification };
  }

  return { feedback, resultType: 'RECORDED' };
}

module.exports = {
  calculateDistanceKm,
  calculateMatchScore,
  getRecommendedNgosForDonation,
  getRecommendedDonationsForNgo,
  recordRecommendationAction,
};
