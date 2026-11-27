const { prisma } = require('../config/database');
const notificationService = require('./notification.service');
const AppError = require('../utils/AppError');

const EDITABLE_STATUSES = ['AVAILABLE', 'REQUESTED'];

function buildSafetyWarnings({
  allergenInfo,
  foodCategory,
  storageRequirements,
  expiresAt,
}) {
  const warnings = [];
  if (allergenInfo) {
    warnings.push(
      `Allergen notice: Contains ${allergenInfo}. Verify recipient dietary restrictions.`
    );
  }
  const cat = (foodCategory || '').toLowerCase();
  if (cat.includes('cooked') || cat.includes('dairy')) {
    warnings.push(
      `Perishable item: Maintain storage conditions (${storageRequirements || 'temperature-controlled'}) and distribute promptly.`
    );
  }
  if (expiresAt) {
    const hoursLeft = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft <= 4) {
      warnings.push('Urgent deadline: Safe-consumption deadline is within 4 hours.');
    }
  }
  warnings.push(
    'Disclaimer: Food safety details are donor-reported. Images or platform listings do not certify food safety.'
  );
  return warnings;
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

async function getDonorProfileByUserId(userId) {
  const profile = await prisma.donorProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError('Donor profile not found for this account.', 404);
  }
  return profile;
}

async function getNgoProfileByUserId(userId) {
  const profile = await prisma.nGOProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError('NGO profile not found for this account.', 404);
  }
  return profile;
}

/**
 * 1. Donor creates a surplus food donation.
 */
async function createDonation(userId, data, imageFile = null) {
  const donorProfile = await getDonorProfileByUserId(userId);
  const imageUrl = imageFile ? `/uploads/donations/${imageFile.filename}` : null;
  const safetyWarnings = buildSafetyWarnings(data);

  return prisma.donation.create({
    data: {
      donorId: donorProfile.id,
      title: data.title,
      description: data.description || null,
      foodCategory: data.foodCategory,
      quantity: data.quantity,
      unit: data.unit,
      preparedAt: data.preparedAt || new Date(),
      expiresAt: data.expiresAt,
      pickupAddress: data.pickupAddress,
      latitude: data.latitude ?? donorProfile.latitude ?? null,
      longitude: data.longitude ?? donorProfile.longitude ?? null,
      imageUrl,
      packagingInfo: data.packagingInfo,
      allergenInfo: data.allergenInfo || null,
      storageRequirements: data.storageRequirements,
      safetyChecklist: data.safetyChecklist,
      safetyWarnings,
      status: 'AVAILABLE',
    },
    include: {
      donor: {
        select: { id: true, organizationName: true, businessType: true },
      },
    },
  });
}

/**
 * 2. Donor edits an eligible (AVAILABLE or REQUESTED) donation.
 */
async function updateDonation(userId, donationId, data, imageFile = null) {
  const donorProfile = await getDonorProfileByUserId(userId);
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });

  if (!donation) {
    throw new AppError('Donation not found.', 404);
  }

  if (donation.donorId !== donorProfile.id) {
    throw new AppError('You do not have permission to edit this donation.', 403);
  }

  if (!EDITABLE_STATUSES.includes(donation.status)) {
    throw new AppError(
      `Cannot edit a donation with status "${donation.status}".`,
      400
    );
  }

  if (donation.expiresAt <= new Date()) {
    await prisma.donation.update({
      where: { id: donation.id },
      data: { status: 'EXPIRED' },
    });
    throw new AppError('Cannot edit an expired donation.', 400);
  }

  const updateData = {};
  const allowedFields = [
    'title',
    'description',
    'foodCategory',
    'quantity',
    'unit',
    'preparedAt',
    'expiresAt',
    'pickupAddress',
    'latitude',
    'longitude',
    'packagingInfo',
    'allergenInfo',
    'storageRequirements',
    'safetyChecklist',
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  if (imageFile) {
    updateData.imageUrl = `/uploads/donations/${imageFile.filename}`;
  }

  const effectivePreparedAt = updateData.preparedAt || donation.preparedAt;
  const effectiveExpiresAt = updateData.expiresAt || donation.expiresAt;
  if (effectiveExpiresAt <= effectivePreparedAt) {
    throw new AppError('Expiry deadline must be after preparation time.', 400);
  }

  return prisma.donation.update({
    where: { id: donationId },
    data: updateData,
    include: {
      requests: {
        include: {
          ngo: {
            select: {
              id: true,
              organizationName: true,
              serviceArea: true,
              isVerified: true,
            },
          },
        },
      },
    },
  });
}

/**
 * 3. Donor cancels an eligible (AVAILABLE or REQUESTED) donation.
 */
async function cancelDonation(userId, donationId) {
  const donorProfile = await getDonorProfileByUserId(userId);
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });

  if (!donation) {
    throw new AppError('Donation not found.', 404);
  }

  if (donation.donorId !== donorProfile.id) {
    throw new AppError('You do not have permission to cancel this donation.', 403);
  }

  if (!EDITABLE_STATUSES.includes(donation.status)) {
    throw new AppError(
      `Cannot cancel a donation with status "${donation.status}".`,
      400
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.donationRequest.updateMany({
      where: { donationId, status: 'PENDING' },
      data: { status: 'REJECTED' },
    });

    return tx.donation.update({
      where: { id: donationId },
      data: { status: 'CANCELLED' },
    });
  });
}

/**
 * 4. Donor views their donation history with incoming NGO requests.
 */
async function getDonorDonations(userId) {
  const donorProfile = await getDonorProfileByUserId(userId);

  return prisma.donation.findMany({
    where: { donorId: donorProfile.id },
    orderBy: { createdAt: 'desc' },
    include: {
      requests: {
        orderBy: { createdAt: 'desc' },
        include: {
          ngo: {
            select: {
              id: true,
              organizationName: true,
              contactPerson: true,
              serviceArea: true,
              isVerified: true,
            },
          },
        },
      },
    },
  });
}

/**
 * 5 & 6. NGO browses available donations with category, quantity, location, and urgency filters.
 */
async function browseAvailableDonations(filters = {}) {
  const now = new Date();
  const where = {
    status: { in: EDITABLE_STATUSES },
    expiresAt: { gt: now },
  };

  if (filters.foodCategory) {
    where.foodCategory = { contains: filters.foodCategory, mode: 'insensitive' };
  }

  if (filters.minQuantity) {
    where.quantity = { gte: filters.minQuantity };
  }

  if (filters.location) {
    where.pickupAddress = { contains: filters.location, mode: 'insensitive' };
  }

  if (filters.urgency && filters.urgency !== 'ALL') {
    const hoursMap = { CRITICAL: 4, HIGH: 12, MEDIUM: 24 };
    const maxHours = hoursMap[filters.urgency];
    if (maxHours) {
      const cutoff = new Date(now.getTime() + maxHours * 60 * 60 * 1000);
      where.expiresAt = { gt: now, lte: cutoff };
    }
  }

  let donations = await prisma.donation.findMany({
    where,
    orderBy: { expiresAt: 'asc' },
    include: {
      donor: {
        select: {
          id: true,
          organizationName: true,
          businessType: true,
        },
      },
      requests: {
        select: {
          id: true,
          ngoId: true,
          status: true,
        },
      },
    },
  });

  // Optional coordinate radius filtering
  if (filters.lat !== undefined && filters.lng !== undefined) {
    const radiusKm = filters.radiusKm || 25;
    donations = donations
      .map((d) => {
        if (d.latitude == null || d.longitude == null) {
          return { ...d, distanceKm: null };
        }
        const distanceKm = Number(
          calculateDistanceKm(filters.lat, filters.lng, d.latitude, d.longitude).toFixed(2)
        );
        return { ...d, distanceKm };
      })
      .filter((d) => d.distanceKm === null || d.distanceKm <= radiusKm);
  }

  return donations;
}

/**
 * 7. NGO requests an available donation.
 */
async function requestDonation(userId, donationId, { requestedQuantity, notes }) {
  const ngoProfile = await getNgoProfileByUserId(userId);

  return prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({ where: { id: donationId } });

    if (!donation) {
      throw new AppError('Donation not found.', 404);
    }

    if (donation.expiresAt <= new Date()) {
      await tx.donation.update({
        where: { id: donation.id },
        data: { status: 'EXPIRED' },
      });
      throw new AppError('This donation has expired and can no longer be requested.', 400);
    }

    if (!EDITABLE_STATUSES.includes(donation.status)) {
      throw new AppError(
        `Donation is not available for requests (current status: ${donation.status}).`,
        400
      );
    }

    if (requestedQuantity && requestedQuantity > donation.quantity) {
      throw new AppError(
        `Requested quantity (${requestedQuantity}) exceeds available quantity (${donation.quantity}).`,
        400
      );
    }

    const existingRequest = await tx.donationRequest.findUnique({
      where: {
        donationId_ngoId: {
          donationId,
          ngoId: ngoProfile.id,
        },
      },
    });

    if (existingRequest) {
      throw new AppError('Your NGO has already submitted a request for this donation.', 409);
    }

    const createdRequest = await tx.donationRequest.create({
      data: {
        donationId,
        ngoId: ngoProfile.id,
        requestedQuantity: requestedQuantity ?? donation.quantity,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        ngo: {
          select: { id: true, organizationName: true, serviceArea: true },
        },
      },
    });

    if (donation.status === 'AVAILABLE') {
      await tx.donation.update({
        where: { id: donationId },
        data: { status: 'REQUESTED' },
      });
    }

    const donor = await tx.donorProfile?.findUnique?.({
      where: { id: donation.donorId },
      select: { userId: true },
    });
    if (donor?.userId) {
      await notificationService.createNotification(
        {
          userId: donor.userId,
          type: 'REQUEST_RECEIVED',
          title: 'New Donation Request Received',
          message: `${ngoProfile.organizationName} requested "${donation.title}".`,
        },
        tx
      );
    }

    return createdRequest;
  });
}

/**
 * 8 & 9. Donor accepts or rejects an NGO request.
 * Uses an atomic conditional update inside a transaction to prevent multiple NGOs
 * from accepting/claiming the same donation concurrently.
 */
async function respondToDonationRequest(userId, requestId, action) {
  const donorProfile = await getDonorProfileByUserId(userId);

  return prisma.$transaction(async (tx) => {
    const request = await tx.donationRequest.findUnique({
      where: { id: requestId },
      include: { donation: true },
    });

    if (!request) {
      throw new AppError('Donation request not found.', 404);
    }

    if (request.donation.donorId !== donorProfile.id) {
      throw new AppError(
        'You do not have permission to respond to requests for this donation.',
        403
      );
    }

    if (request.status !== 'PENDING') {
      throw new AppError(
        `This request has already been processed (${request.status}).`,
        400
      );
    }

    if (action === 'REJECT') {
      const rejectedRequest = await tx.donationRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });

      const remainingPending = await tx.donationRequest.count({
        where: { donationId: request.donationId, status: 'PENDING' },
      });

      if (remainingPending === 0 && request.donation.status === 'REQUESTED') {
        await tx.donation.update({
          where: { id: request.donationId },
          data: { status: 'AVAILABLE' },
        });
      }

      const rejectedNgo = await tx.nGOProfile?.findUnique?.({
        where: { id: request.ngoId },
        select: { userId: true },
      });
      if (rejectedNgo?.userId) {
        await notificationService.createNotification(
          {
            userId: rejectedNgo.userId,
            type: 'REQUEST_REJECTED',
            title: 'Donation Request Rejected',
            message: `Your request for "${request.donation.title}" was not accepted.`,
          },
          tx
        );
      }

      return { request: rejectedRequest, donationStatus: remainingPending === 0 ? 'AVAILABLE' : request.donation.status };
    }

    // ACCEPT flow with atomic race-condition guard
    const now = new Date();
    if (request.donation.expiresAt <= now) {
      await tx.donation.update({
        where: { id: request.donationId },
        data: { status: 'EXPIRED' },
      });
      throw new AppError('Cannot accept a request for an expired donation.', 400);
    }

    const claimed = await tx.donation.updateMany({
      where: {
        id: request.donationId,
        status: { in: EDITABLE_STATUSES },
        expiresAt: { gt: now },
      },
      data: { status: 'ACCEPTED' },
    });

    if (claimed.count === 0) {
      throw new AppError(
        'This donation has already been accepted or is no longer available.',
        409
      );
    }

    const approvedRequest = await tx.donationRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });

    // Reject all other pending requests for this donation
    await tx.donationRequest.updateMany({
      where: {
        donationId: request.donationId,
        id: { not: requestId },
        status: 'PENDING',
      },
      data: { status: 'REJECTED' },
    });

    const approvedNgo = await tx.nGOProfile?.findUnique?.({
      where: { id: request.ngoId },
      select: { userId: true },
    });
    if (approvedNgo?.userId) {
      await notificationService.createNotification(
        {
          userId: approvedNgo.userId,
          type: 'REQUEST_APPROVED',
          title: 'Donation Request Accepted!',
          message: `Your request for "${request.donation.title}" has been accepted. You can now request a volunteer for pickup.`,
        },
        tx
      );
    }

    return { request: approvedRequest, donationStatus: 'ACCEPTED' };
  });
}

/**
 * 10. Scheduled job helper: mark overdue AVAILABLE/REQUESTED donations as EXPIRED.
 */
async function expireOverdueDonations() {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const overdue = await tx.donation.findMany({
      where: {
        status: { in: EDITABLE_STATUSES },
        expiresAt: { lte: now },
      },
      select: { id: true },
    });

    if (overdue.length === 0) {
      return { expiredCount: 0 };
    }

    const overdueIds = overdue.map((d) => d.id);

    await tx.donationRequest.updateMany({
      where: {
        donationId: { in: overdueIds },
        status: 'PENDING',
      },
      data: { status: 'REJECTED' },
    });

    const result = await tx.donation.updateMany({
      where: { id: { in: overdueIds } },
      data: { status: 'EXPIRED' },
    });

    return { expiredCount: result.count };
  });
}

/**
 * Notify donors when an active donation is approaching expiry (within 2 hours).
 */
async function notifyExpiringSoonDonations() {
  const now = new Date();
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const expiringSoon = await prisma.donation.findMany({
    where: {
      status: { in: EDITABLE_STATUSES },
      expiresAt: { gt: now, lte: twoHoursFromNow },
      expiryAlertSentAt: null,
    },
    include: {
      donor: { select: { userId: true } },
    },
  });

  for (const donation of expiringSoon) {
    if (donation.donor?.userId) {
      await notificationService.createNotification({
        userId: donation.donor.userId,
        type: 'DONATION_EXPIRING_SOON',
        title: 'Donation Approaching Expiry',
        message: `Your donation "${donation.title}" expires within 2 hours (${new Date(
          donation.expiresAt
        ).toLocaleTimeString()}).`,
      });
    }
    await prisma.donation.update({
      where: { id: donation.id },
      data: { expiryAlertSentAt: now },
    });
  }

  return { alertedCount: expiringSoon.length };
}

/**
 * Report a donation for food safety or compliance review by an administrator.
 */
async function reportDonation(userId, donationId, { reason, details }) {
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });
  if (!donation) {
    throw new AppError('Donation not found.', 404);
  }

  return prisma.donationReport.create({
    data: {
      donationId,
      reportedByUserId: userId,
      reason,
      details: details || null,
      status: 'OPEN',
    },
  });
}

module.exports = {
  createDonation,
  updateDonation,
  cancelDonation,
  getDonorDonations,
  browseAvailableDonations,
  requestDonation,
  respondToDonationRequest,
  expireOverdueDonations,
  notifyExpiringSoonDonations,
  reportDonation,
};
