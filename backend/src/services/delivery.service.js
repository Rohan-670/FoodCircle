const crypto = require('crypto');
const { prisma } = require('../config/database');
const routingService = require('./routing.service');
const deliverySocket = require('../sockets/deliverySocket');
const AppError = require('../utils/AppError');

function generateSecureQrToken() {
  return crypto.randomBytes(32).toString('hex'); // 256-bit unpredictable token
}

function verifyQrToken(providedToken, expectedToken) {
  if (!providedToken || !expectedToken) return false;
  const a = Buffer.from(String(providedToken), 'utf8');
  const b = Buffer.from(String(expectedToken), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function sanitizeDeliveryForRole(delivery, role, isOwnerOrAssigned) {
  if (!delivery) return null;

  const {
    pickupQrToken,
    deliveryQrToken,
    ...base
  } = delivery;

  if (!isOwnerOrAssigned) {
    return {
      ...base,
      lastVolunteerLat: null,
      lastVolunteerLng: null,
      lastLocationUpdatedAt: null,
    };
  }

  return {
    ...base,
    // Expose pickup QR token ONLY to the owning DONOR while unused
    ...(role === 'DONOR' && !delivery.pickupQrUsedAt ? { pickupQrToken } : {}),
    // Expose delivery QR token ONLY to the owning NGO while unused
    ...(role === 'NGO' && !delivery.deliveryQrUsedAt ? { deliveryQrToken } : {}),
  };
}

async function assertDeliveryAccess(userId, role, deliveryId) {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: {
      donation: {
        include: {
          donor: { select: { id: true, userId: true, organizationName: true } },
        },
      },
      volunteer: {
        include: {
          user: { select: { id: true, fullName: true, phone: true } },
        },
      },
    },
  });

  if (!delivery) {
    throw new AppError('Delivery task not found.', 404);
  }

  if (role === 'ADMIN') {
    return delivery;
  }

  if (role === 'DONOR' && delivery.donation?.donor?.userId === userId) {
    return delivery;
  }

  if (role === 'NGO') {
    const ngo = await prisma.nGOProfile.findUnique({ where: { userId } });
    if (ngo && ngo.id === delivery.ngoId) {
      return delivery;
    }
  }

  if (role === 'VOLUNTEER') {
    const vol = await prisma.volunteerProfile.findUnique({ where: { userId } });
    if (vol && vol.id === delivery.volunteerId) {
      return delivery;
    }
  }

  throw new AppError(
    'Access denied. You are not authorized to access this delivery.',
    403
  );
}

/**
 * 1. NGO requests a volunteer for an ACCEPTED donation.
 */
async function requestVolunteerForDonation(userId, donationId, notes = null) {
  const ngoProfile = await prisma.nGOProfile.findUnique({ where: { userId } });
  if (!ngoProfile) {
    throw new AppError('NGO profile not found.', 404);
  }

  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: {
      requests: {
        where: { ngoId: ngoProfile.id, status: 'APPROVED' },
      },
      delivery: true,
    },
  });

  if (!donation) {
    throw new AppError('Donation not found.', 404);
  }

  if (donation.status !== 'ACCEPTED') {
    throw new AppError(
      `Volunteers can only be requested for ACCEPTED donations (current: ${donation.status}).`,
      400
    );
  }

  if (!donation.requests || donation.requests.length === 0) {
    throw new AppError(
      'Only the NGO whose request was approved can request a volunteer.',
      403
    );
  }

  if (donation.delivery) {
    throw new AppError('A delivery task already exists for this donation.', 409);
  }

  // Optionally calculate initial route ETA (non-blocking fallback if routing fails)
  const routeInfo = await routingService.getRoute(
    { lat: donation.latitude, lng: donation.longitude },
    { lat: ngoProfile.latitude, lng: ngoProfile.longitude }
  );

  const delivery = await prisma.delivery.create({
    data: {
      donationId: donation.id,
      ngoId: ngoProfile.id,
      status: 'PENDING_VOLUNTEER',
      pickupAddress: donation.pickupAddress,
      pickupLatitude: donation.latitude,
      pickupLongitude: donation.longitude,
      deliveryAddress: ngoProfile.address,
      deliveryLatitude: ngoProfile.latitude,
      deliveryLongitude: ngoProfile.longitude,
      pickupQrToken: generateSecureQrToken(),
      deliveryQrToken: generateSecureQrToken(),
      estimatedArrivalMinutes: routeInfo.durationMinutes,
      notes: notes || null,
    },
  });

  return sanitizeDeliveryForRole(delivery, 'NGO', true);
}

/**
 * 2. Volunteers view available delivery tasks (PENDING_VOLUNTEER).
 */
async function listAvailableTasks() {
  const deliveries = await prisma.delivery.findMany({
    where: {
      status: 'PENDING_VOLUNTEER',
      volunteerId: null,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      donation: {
        select: {
          id: true,
          title: true,
          foodCategory: true,
          quantity: true,
          unit: true,
          expiresAt: true,
          donor: { select: { organizationName: true } },
        },
      },
    },
  });

  return deliveries.map((d) => sanitizeDeliveryForRole(d, 'VOLUNTEER', false));
}

/**
 * List deliveries relevant to the logged-in user (DONOR, NGO, or VOLUNTEER).
 */
async function listMyDeliveries(userId, role) {
  let where = {};

  if (role === 'VOLUNTEER') {
    const vol = await prisma.volunteerProfile.findUnique({ where: { userId } });
    if (!vol) throw new AppError('Volunteer profile not found.', 404);
    where = { volunteerId: vol.id };
  } else if (role === 'NGO') {
    const ngo = await prisma.nGOProfile.findUnique({ where: { userId } });
    if (!ngo) throw new AppError('NGO profile not found.', 404);
    where = { ngoId: ngo.id };
  } else if (role === 'DONOR') {
    const donor = await prisma.donorProfile.findUnique({ where: { userId } });
    if (!donor) throw new AppError('Donor profile not found.', 404);
    where = { donation: { donorId: donor.id } };
  }

  const deliveries = await prisma.delivery.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      donation: {
        select: {
          id: true,
          title: true,
          foodCategory: true,
          quantity: true,
          unit: true,
          expiresAt: true,
          donor: { select: { organizationName: true } },
        },
      },
      volunteer: {
        include: { user: { select: { fullName: true, phone: true } } },
      },
    },
  });

  return deliveries.map((d) => sanitizeDeliveryForRole(d, role, true));
}

/**
 * 3 & 4. Volunteer accepts an eligible task atomically inside a transaction.
 */
async function acceptDeliveryTask(userId, deliveryId) {
  const volunteerProfile = await prisma.volunteerProfile.findUnique({
    where: { userId },
  });
  if (!volunteerProfile) {
    throw new AppError('Volunteer profile not found.', 404);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.delivery.findUnique({ where: { id: deliveryId } });
    if (!existing) {
      throw new AppError('Delivery task not found.', 404);
    }

    // Atomic conditional update to prevent two volunteers accepting the same task
    const claimed = await tx.delivery.updateMany({
      where: {
        id: deliveryId,
        status: 'PENDING_VOLUNTEER',
        volunteerId: null,
      },
      data: {
        volunteerId: volunteerProfile.id,
        status: 'VOLUNTEER_ASSIGNED',
      },
    });

    if (claimed.count === 0) {
      throw new AppError(
        'This delivery task has already been accepted by another volunteer or is no longer available.',
        409
      );
    }

    await tx.donation.update({
      where: { id: existing.donationId },
      data: { status: 'ASSIGNED' },
    });

    return tx.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        donation: {
          select: { id: true, title: true, status: true },
        },
      },
    });
  });

  deliverySocket.emitDeliveryStatus(deliveryId, {
    deliveryId,
    status: updated.status,
    volunteerId: volunteerProfile.id,
    updatedAt: new Date().toISOString(),
  });

  return sanitizeDeliveryForRole(updated, 'VOLUNTEER', true);
}

/**
 * Get authorized delivery details (including single-use QR token for Donor/NGO).
 */
async function getDeliveryById(userId, role, deliveryId) {
  const delivery = await assertDeliveryAccess(userId, role, deliveryId);
  return sanitizeDeliveryForRole(delivery, role, true);
}

/**
 * Get routing geometry and ETA for a delivery (with OSRM + graceful fallback).
 */
async function getDeliveryRoute(userId, role, deliveryId, fetchImpl = fetch) {
  const delivery = await assertDeliveryAccess(userId, role, deliveryId);

  const origin =
    delivery.isLocationSharing &&
    delivery.lastVolunteerLat != null &&
    delivery.lastVolunteerLng != null
      ? { lat: delivery.lastVolunteerLat, lng: delivery.lastVolunteerLng }
      : { lat: delivery.pickupLatitude, lng: delivery.pickupLongitude };

  const destination =
    delivery.status === 'VOLUNTEER_ASSIGNED' || delivery.status === 'PENDING_VOLUNTEER'
      ? { lat: delivery.pickupLatitude, lng: delivery.pickupLongitude }
      : { lat: delivery.deliveryLatitude, lng: delivery.deliveryLongitude };

  // If volunteer is not sharing yet and hasn't picked up, show full pickup -> delivery route
  const effectiveOrigin =
    delivery.status === 'VOLUNTEER_ASSIGNED' && !delivery.isLocationSharing
      ? { lat: delivery.pickupLatitude, lng: delivery.pickupLongitude }
      : origin;
  const effectiveDestination =
    delivery.status === 'VOLUNTEER_ASSIGNED' && !delivery.isLocationSharing
      ? { lat: delivery.deliveryLatitude, lng: delivery.deliveryLongitude }
      : destination;

  return routingService.getRoute(effectiveOrigin, effectiveDestination, fetchImpl);
}

/**
 * 8 & 9. Volunteer shares live GPS location with explicit consent.
 */
async function updateVolunteerLocation(
  userId,
  deliveryId,
  { latitude, longitude, consentGranted }
) {
  if (!consentGranted) {
    throw new AppError(
      'Explicit volunteer consent is required before sharing live location.',
      400
    );
  }

  const volunteerProfile = await prisma.volunteerProfile.findUnique({
    where: { userId },
  });
  if (!volunteerProfile) {
    throw new AppError('Volunteer profile not found.', 404);
  }

  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) {
    throw new AppError('Delivery task not found.', 404);
  }

  if (delivery.volunteerId !== volunteerProfile.id) {
    throw new AppError(
      'Only the assigned volunteer can share location for this delivery.',
      403
    );
  }

  if (['DELIVERY_CONFIRMED', 'CANCELLED', 'FAILED'].includes(delivery.status)) {
    throw new AppError(
      `Location sharing is disabled because delivery is ${delivery.status}.`,
      400
    );
  }

  const now = new Date();
  const [updatedDelivery] = await prisma.$transaction([
    prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        isLocationSharing: true,
        lastVolunteerLat: latitude,
        lastVolunteerLng: longitude,
        lastLocationUpdatedAt: now,
      },
    }),
    prisma.volunteerProfile.update({
      where: { id: volunteerProfile.id },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
      },
    }),
  ]);

  deliverySocket.emitVolunteerLocation(deliveryId, {
    deliveryId,
    latitude,
    longitude,
    isLocationSharing: true,
    updatedAt: now.toISOString(),
  });

  return {
    deliveryId,
    isLocationSharing: updatedDelivery.isLocationSharing,
    latitude,
    longitude,
    updatedAt: now.toISOString(),
  };
}

/**
 * 10. Volunteer stops live location sharing.
 */
async function stopVolunteerLocation(userId, deliveryId) {
  const volunteerProfile = await prisma.volunteerProfile.findUnique({
    where: { userId },
  });
  if (!volunteerProfile) {
    throw new AppError('Volunteer profile not found.', 404);
  }

  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) {
    throw new AppError('Delivery task not found.', 404);
  }

  if (delivery.volunteerId !== volunteerProfile.id) {
    throw new AppError(
      'Only the assigned volunteer can stop location sharing for this delivery.',
      403
    );
  }

  await prisma.delivery.update({
    where: { id: deliveryId },
    data: { isLocationSharing: false },
  });

  deliverySocket.emitLocationStopped(deliveryId);

  return { deliveryId, isLocationSharing: false };
}

/**
 * 12. QR-based pickup confirmation (single-use, unpredictable token).
 */
async function confirmPickupByQr(userId, deliveryId, providedToken) {
  const volunteerProfile = await prisma.volunteerProfile.findUnique({
    where: { userId },
  });
  if (!volunteerProfile) {
    throw new AppError('Volunteer profile not found.', 404);
  }

  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) {
    throw new AppError('Delivery task not found.', 404);
  }

  if (delivery.volunteerId !== volunteerProfile.id) {
    throw new AppError('Only the assigned volunteer can confirm pickup.', 403);
  }

  if (delivery.pickupQrUsedAt) {
    throw new AppError(
      'Pickup QR token has already been used. Replay is not permitted.',
      409
    );
  }

  if (delivery.status !== 'VOLUNTEER_ASSIGNED') {
    throw new AppError(
      `Pickup cannot be confirmed from status "${delivery.status}".`,
      400
    );
  }

  if (!verifyQrToken(providedToken, delivery.pickupQrToken)) {
    throw new AppError('Invalid pickup QR verification token.', 400);
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const updatedDelivery = await tx.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'PICKUP_CONFIRMED',
        pickupQrUsedAt: now,
        pickedUpAt: now,
      },
    });

    await tx.donation.update({
      where: { id: delivery.donationId },
      data: { status: 'PICKED_UP' },
    });

    return updatedDelivery;
  });

  deliverySocket.emitDeliveryStatus(deliveryId, {
    deliveryId,
    status: updated.status,
    pickedUpAt: now.toISOString(),
  });

  return sanitizeDeliveryForRole(updated, 'VOLUNTEER', true);
}

/**
 * Transition delivery from PICKUP_CONFIRMED to IN_TRANSIT.
 */
async function startTransit(userId, deliveryId) {
  const volunteerProfile = await prisma.volunteerProfile.findUnique({
    where: { userId },
  });
  if (!volunteerProfile) {
    throw new AppError('Volunteer profile not found.', 404);
  }

  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) {
    throw new AppError('Delivery task not found.', 404);
  }

  if (delivery.volunteerId !== volunteerProfile.id) {
    throw new AppError('Only the assigned volunteer can start transit.', 403);
  }

  if (delivery.status !== 'PICKUP_CONFIRMED') {
    throw new AppError(
      `Cannot start transit from status "${delivery.status}".`,
      400
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedDelivery = await tx.delivery.update({
      where: { id: deliveryId },
      data: { status: 'IN_TRANSIT' },
    });

    await tx.donation.update({
      where: { id: delivery.donationId },
      data: { status: 'IN_TRANSIT' },
    });

    return updatedDelivery;
  });

  deliverySocket.emitDeliveryStatus(deliveryId, {
    deliveryId,
    status: updated.status,
    updatedAt: new Date().toISOString(),
  });

  return sanitizeDeliveryForRole(updated, 'VOLUNTEER', true);
}

/**
 * 13. QR-based delivery confirmation (single-use, automatically stops location sharing).
 */
async function confirmDeliveryByQr(userId, deliveryId, providedToken) {
  const volunteerProfile = await prisma.volunteerProfile.findUnique({
    where: { userId },
  });
  if (!volunteerProfile) {
    throw new AppError('Volunteer profile not found.', 404);
  }

  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) {
    throw new AppError('Delivery task not found.', 404);
  }

  if (delivery.volunteerId !== volunteerProfile.id) {
    throw new AppError('Only the assigned volunteer can confirm delivery.', 403);
  }

  if (delivery.deliveryQrUsedAt) {
    throw new AppError(
      'Delivery QR token has already been used. Replay is not permitted.',
      409
    );
  }

  if (!['PICKUP_CONFIRMED', 'IN_TRANSIT'].includes(delivery.status)) {
    throw new AppError(
      `Delivery cannot be confirmed from status "${delivery.status}".`,
      400
    );
  }

  if (!verifyQrToken(providedToken, delivery.deliveryQrToken)) {
    throw new AppError('Invalid delivery QR verification token.', 400);
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const updatedDelivery = await tx.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'DELIVERY_CONFIRMED',
        deliveryQrUsedAt: now,
        deliveredAt: now,
        isLocationSharing: false, // Stop location sharing automatically on completion
      },
    });

    await tx.donation.update({
      where: { id: delivery.donationId },
      data: { status: 'DELIVERED' },
    });

    return updatedDelivery;
  });

  deliverySocket.emitLocationStopped(deliveryId);
  deliverySocket.emitDeliveryStatus(deliveryId, {
    deliveryId,
    status: updated.status,
    deliveredAt: now.toISOString(),
    isLocationSharing: false,
  });

  return sanitizeDeliveryForRole(updated, 'VOLUNTEER', true);
}

/**
 * Cancel a delivery (automatically stops location sharing).
 */
async function cancelDelivery(userId, role, deliveryId) {
  const delivery = await assertDeliveryAccess(userId, role, deliveryId);

  if (delivery.status === 'DELIVERY_CONFIRMED' || delivery.status === 'CANCELLED') {
    throw new AppError(
      `Cannot cancel delivery with status "${delivery.status}".`,
      400
    );
  }

  const updated = await prisma.delivery.update({
    where: { id: deliveryId },
    data: {
      status: 'CANCELLED',
      isLocationSharing: false,
    },
  });

  deliverySocket.emitLocationStopped(deliveryId);
  deliverySocket.emitDeliveryStatus(deliveryId, {
    deliveryId,
    status: updated.status,
    isLocationSharing: false,
  });

  return sanitizeDeliveryForRole(updated, role, true);
}

module.exports = {
  requestVolunteerForDonation,
  listAvailableTasks,
  listMyDeliveries,
  acceptDeliveryTask,
  getDeliveryById,
  getDeliveryRoute,
  updateVolunteerLocation,
  stopVolunteerLocation,
  confirmPickupByQr,
  startTransit,
  confirmDeliveryByQr,
  cancelDelivery,
};
