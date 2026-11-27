const { prisma } = require('../config/database');
const matchingService = require('./matching.service');
const AppError = require('../utils/AppError');

async function getDonorDashboard(userId) {
  const donorProfile = await prisma.donorProfile.findUnique({ where: { userId } });
  if (!donorProfile) {
    throw new AppError('Donor profile not found.', 404);
  }

  const donations = await prisma.donation.findMany({
    where: { donorId: donorProfile.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      requests: {
        include: {
          ngo: { select: { id: true, organizationName: true } },
        },
      },
    },
  });

  const activeDonations = donations.filter((d) =>
    ['AVAILABLE', 'REQUESTED'].includes(d.status)
  );
  const acceptedDonations = donations.filter((d) =>
    ['ACCEPTED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)
  );
  const completedDonations = donations.filter((d) => d.status === 'DELIVERED');

  const recentActivity = await prisma.notification.findMany({
    where: { userId },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  return {
    summary: {
      activeCount: activeDonations.length,
      acceptedCount: acceptedDonations.length,
      completedCount: completedDonations.length,
      totalPosted: donations.length,
    },
    activeDonations,
    acceptedDonations,
    completedDonations,
    recentActivity,
  };
}

async function getNgoDashboard(userId) {
  const ngoProfile = await prisma.nGOProfile.findUnique({ where: { userId } });
  if (!ngoProfile) {
    throw new AppError('NGO profile not found.', 404);
  }

  const [recommendationsResult, requests, deliveries] = await Promise.all([
    matchingService.getRecommendedDonationsForNgo(userId, {}),
    prisma.donationRequest.findMany({
      where: { ngoId: ngoProfile.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        donation: {
          include: {
            donor: { select: { organizationName: true } },
          },
        },
      },
    }),
    prisma.delivery.findMany({
      where: {
        ngoId: ngoProfile.id,
        status: {
          in: [
            'PENDING_VOLUNTEER',
            'VOLUNTEER_ASSIGNED',
            'PICKUP_CONFIRMED',
            'IN_TRANSIT',
          ],
        },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        donation: { select: { id: true, title: true, quantity: true, unit: true } },
        volunteer: { include: { user: { select: { fullName: true } } } },
      },
    }),
  ]);

  const acceptedDonations = requests.filter((r) => r.status === 'APPROVED');
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const sanitizedDeliveries = deliveries.map(
    ({ pickupQrToken, deliveryQrToken, ...rest }) => rest
  );

  return {
    summary: {
      recommendedCount: recommendationsResult.recommendations.length,
      acceptedCount: acceptedDonations.length,
      pendingRequestsCount: pendingRequests.length,
      incomingDeliveriesCount: sanitizedDeliveries.length,
    },
    ngoVerified: recommendationsResult.ngoVerified,
    recommendedDonations: recommendationsResult.recommendations.slice(0, 5),
    acceptedDonations,
    pendingRequests,
    incomingDeliveries: sanitizedDeliveries,
  };
}

async function getVolunteerDashboard(userId) {
  const volunteerProfile = await prisma.volunteerProfile.findUnique({
    where: { userId },
  });
  if (!volunteerProfile) {
    throw new AppError('Volunteer profile not found.', 404);
  }

  const [availableTasks, myDeliveries] = await Promise.all([
    prisma.delivery.findMany({
      where: { status: 'PENDING_VOLUNTEER', volunteerId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        donation: {
          select: { id: true, title: true, quantity: true, unit: true, expiresAt: true },
        },
      },
    }),
    prisma.delivery.findMany({
      where: { volunteerId: volunteerProfile.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        donation: { select: { id: true, title: true, quantity: true, unit: true } },
      },
    }),
  ]);

  const sanitize = (list) =>
    list.map(({ pickupQrToken, deliveryQrToken, ...rest }) => rest);

  const assignedTasks = myDeliveries.filter((d) =>
    ['VOLUNTEER_ASSIGNED', 'PICKUP_CONFIRMED', 'IN_TRANSIT'].includes(d.status)
  );
  const completedDeliveries = myDeliveries.filter(
    (d) => d.status === 'DELIVERY_CONFIRMED'
  );

  return {
    summary: {
      availableCount: availableTasks.length,
      assignedCount: assignedTasks.length,
      completedCount: completedDeliveries.length,
      totalHistoryCount: myDeliveries.length,
    },
    availableTasks: sanitize(availableTasks),
    assignedTasks: sanitize(assignedTasks),
    completedDeliveries: sanitize(completedDeliveries),
    deliveryHistory: sanitize(myDeliveries),
  };
}

module.exports = {
  getDonorDashboard,
  getNgoDashboard,
  getVolunteerDashboard,
};
