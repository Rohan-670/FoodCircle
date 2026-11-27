const { prisma } = require('../config/database');

/**
 * Compute platform-wide impact analytics directly from PostgreSQL records.
 * Never fabricates statistics; returns 0 when no records exist.
 */
async function getImpactAnalytics() {
  const [
    donatedAgg,
    deliveredAgg,
    completedDonationsCount,
    participatingNgosCount,
    activeVolunteersCount,
    categoryGroups,
  ] = await Promise.all([
    prisma.donation.aggregate({
      _sum: { quantity: true },
      where: { status: { not: 'CANCELLED' } },
    }),
    prisma.donation.aggregate({
      _sum: { quantity: true },
      where: { status: 'DELIVERED' },
    }),
    prisma.donation.count({
      where: { status: 'DELIVERED' },
    }),
    prisma.nGOProfile.count({
      where: { isVerified: true, user: { isActive: true } },
    }),
    prisma.volunteerProfile.count({
      where: { isAvailable: true, user: { isActive: true } },
    }),
    prisma.donation.groupBy({
      by: ['foodCategory'],
      _sum: { quantity: true },
      _count: { id: true },
      where: { status: { not: 'CANCELLED' } },
    }),
  ]);

  const categoryBreakdown = categoryGroups.map((group) => ({
    category: group.foodCategory,
    totalQuantity: group._sum?.quantity || 0,
    donationCount: group._count?.id || 0,
  }));

  return {
    totalFoodDonated: donatedAgg._sum?.quantity || 0,
    totalFoodDelivered: deliveredAgg._sum?.quantity || 0,
    completedDonationsCount,
    participatingNgosCount,
    activeVolunteersCount,
    categoryBreakdown,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  getImpactAnalytics,
};
