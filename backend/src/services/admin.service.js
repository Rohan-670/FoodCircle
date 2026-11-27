const { prisma } = require('../config/database');
const { sanitizeUser } = require('../utils/userSerializer');
const AppError = require('../utils/AppError');

function buildPagination(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

async function recordAuditLog(txOrPrisma, adminId, action, targetType, targetId, details = null) {
  return txOrPrisma.auditLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      details,
    },
  });
}

/**
 * Admin Dashboard Metrics
 */
async function getDashboardStats() {
  const [
    totalUsers,
    totalDonors,
    totalNgos,
    totalVolunteers,
    availableDonations,
    completedDonations,
    cancelledAndExpiredDonations,
    activeDeliveries,
    pendingNgos,
    pendingDonors,
    openReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'DONOR' } }),
    prisma.user.count({ where: { role: 'NGO' } }),
    prisma.user.count({ where: { role: 'VOLUNTEER' } }),
    prisma.donation.count({ where: { status: { in: ['AVAILABLE', 'REQUESTED'] } } }),
    prisma.donation.count({ where: { status: 'DELIVERED' } }),
    prisma.donation.count({ where: { status: { in: ['CANCELLED', 'EXPIRED'] } } }),
    prisma.delivery.count({
      where: {
        status: {
          in: [
            'PENDING_VOLUNTEER',
            'VOLUNTEER_ASSIGNED',
            'PICKUP_CONFIRMED',
            'IN_TRANSIT',
          ],
        },
      },
    }),
    prisma.nGOProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.donorProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.donationReport.count({ where: { status: 'OPEN' } }),
  ]);

  return {
    totalUsers,
    totalDonors,
    totalNgos,
    totalVolunteers,
    availableDonations,
    completedDonations,
    cancelledAndExpiredDonations,
    activeDeliveries,
    pendingVerifications: pendingNgos + pendingDonors,
    pendingNgos,
    pendingDonors,
    openReports,
  };
}

/**
 * Paginated and filtered user list (sanitized; no passwordHash).
 */
async function listUsers({ page = 1, limit = 20, role, isActive, search } = {}) {
  const where = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        donorProfile: true,
        ngoProfile: true,
        volunteerProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map(sanitizeUser),
    pagination: buildPagination(page, limit, total),
  };
}

/**
 * Suspend or reactivate an account and record an audit log entry.
 */
async function updateUserAccountStatus(targetUserId, isActive, currentAdminId) {
  if (targetUserId === currentAdminId && !isActive) {
    throw new AppError('Administrators cannot suspend their own account.', 400);
  }

  const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!existing) {
    throw new AppError('User not found.', 404);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: targetUserId },
      data: { isActive },
      include: {
        donorProfile: true,
        ngoProfile: true,
        volunteerProfile: true,
      },
    });

    await recordAuditLog(
      tx,
      currentAdminId,
      isActive ? 'ACCOUNT_REACTIVATED' : 'ACCOUNT_SUSPENDED',
      'USER',
      targetUserId,
      { email: existing.email, role: existing.role, isActive }
    );

    return user;
  });

  return sanitizeUser(updated);
}

/**
 * Verify or reject an NGO with notes, verification history, and audit log.
 */
async function verifyNgoProfile(ngoId, decision, adminId) {
  const existing = await prisma.nGOProfile.findUnique({ where: { id: ngoId } });
  if (!existing) {
    throw new AppError('NGO profile not found.', 404);
  }

  const status =
    decision.status || (decision.isVerified ? 'APPROVED' : 'REJECTED');
  const isVerified = status === 'APPROVED';
  const notes = decision.notes || null;

  return prisma.$transaction(async (tx) => {
    const ngoProfile = await tx.nGOProfile.update({
      where: { id: ngoId },
      data: {
        isVerified,
        verificationStatus: status,
        verificationNotes: notes,
      },
    });

    await tx.verificationRecord.create({
      data: {
        targetType: 'NGO',
        targetProfileId: ngoId,
        status,
        notes,
        reviewedByAdminId: adminId,
      },
    });

    await recordAuditLog(
      tx,
      adminId,
      status === 'APPROVED' ? 'NGO_VERIFIED' : 'NGO_REJECTED',
      'NGO_PROFILE',
      ngoId,
      { organizationName: existing.organizationName, status, notes }
    );

    return ngoProfile;
  });
}

/**
 * Verify or reject a Donor profile with notes, verification history, and audit log.
 */
async function verifyDonorProfile(donorId, decision, adminId) {
  const existing = await prisma.donorProfile.findUnique({ where: { id: donorId } });
  if (!existing) {
    throw new AppError('Donor profile not found.', 404);
  }

  const status =
    decision.status || (decision.isVerified ? 'APPROVED' : 'REJECTED');
  const isVerified = status === 'APPROVED';
  const notes = decision.notes || null;

  return prisma.$transaction(async (tx) => {
    const donorProfile = await tx.donorProfile.update({
      where: { id: donorId },
      data: {
        isVerified,
        verificationStatus: status,
        verificationNotes: notes,
      },
    });

    await tx.verificationRecord.create({
      data: {
        targetType: 'DONOR',
        targetProfileId: donorId,
        status,
        notes,
        reviewedByAdminId: adminId,
      },
    });

    await recordAuditLog(
      tx,
      adminId,
      status === 'APPROVED' ? 'DONOR_VERIFIED' : 'DONOR_REJECTED',
      'DONOR_PROFILE',
      donorId,
      { organizationName: existing.organizationName, status, notes }
    );

    return donorProfile;
  });
}

/**
 * Paginated verification history.
 */
async function getVerificationHistory({
  page = 1,
  limit = 20,
  targetType,
  targetProfileId,
} = {}) {
  const where = {};
  if (targetType) where.targetType = targetType;
  if (targetProfileId) where.targetProfileId = targetProfileId;

  const skip = (page - 1) * limit;
  const [records, total] = await Promise.all([
    prisma.verificationRecord.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.verificationRecord.count({ where }),
  ]);

  return {
    records,
    pagination: buildPagination(page, limit, total),
  };
}

/**
 * Paginated reported donations list.
 */
async function listReports({ page = 1, limit = 20, status } = {}) {
  const where = {};
  if (status) where.status = status;

  const skip = (page - 1) * limit;
  const [reports, total] = await Promise.all([
    prisma.donationReport.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        donation: {
          select: {
            id: true,
            title: true,
            status: true,
            foodCategory: true,
            expiresAt: true,
          },
        },
      },
    }),
    prisma.donationReport.count({ where }),
  ]);

  return {
    reports,
    pagination: buildPagination(page, limit, total),
  };
}

/**
 * Admin reviews a reported donation (optionally cancelling an unsafe donation).
 */
async function reviewReport(reportId, { status, adminNotes, cancelDonation }, adminId) {
  const existing = await prisma.donationReport.findUnique({
    where: { id: reportId },
    include: { donation: true },
  });

  if (!existing) {
    throw new AppError('Donation report not found.', 404);
  }

  return prisma.$transaction(async (tx) => {
    const updatedReport = await tx.donationReport.update({
      where: { id: reportId },
      data: {
        status,
        adminNotes: adminNotes || null,
        reviewedByAdminId: adminId,
        reviewedAt: new Date(),
      },
    });

    if (
      cancelDonation &&
      existing.donation &&
      ['AVAILABLE', 'REQUESTED', 'ACCEPTED'].includes(existing.donation.status)
    ) {
      await tx.donation.update({
        where: { id: existing.donationId },
        data: { status: 'CANCELLED' },
      });
    }

    await recordAuditLog(
      tx,
      adminId,
      'DONATION_REPORT_REVIEWED',
      'DONATION_REPORT',
      reportId,
      {
        donationId: existing.donationId,
        status,
        cancelDonation: Boolean(cancelDonation),
        adminNotes: adminNotes || null,
      }
    );

    return updatedReport;
  });
}

/**
 * Paginated and filtered donations view for Admin.
 */
async function listDonations({ page = 1, limit = 20, status, foodCategory } = {}) {
  const where = {};
  if (status) where.status = status;
  if (foodCategory) {
    where.foodCategory = { contains: foodCategory, mode: 'insensitive' };
  }

  const skip = (page - 1) * limit;
  const [donations, total] = await Promise.all([
    prisma.donation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        donor: { select: { id: true, organizationName: true, isVerified: true } },
      },
    }),
    prisma.donation.count({ where }),
  ]);

  return {
    donations,
    pagination: buildPagination(page, limit, total),
  };
}

/**
 * Paginated and filtered deliveries view for Admin (strips raw QR tokens).
 */
async function listDeliveries({ page = 1, limit = 20, status } = {}) {
  const where = {};
  if (status) where.status = status;

  const skip = (page - 1) * limit;
  const [deliveries, total] = await Promise.all([
    prisma.delivery.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        donation: { select: { id: true, title: true, status: true } },
        volunteer: {
          select: {
            id: true,
            user: { select: { fullName: true } },
          },
        },
      },
    }),
    prisma.delivery.count({ where }),
  ]);

  const sanitized = deliveries.map(({ pickupQrToken, deliveryQrToken, ...rest }) => rest);

  return {
    deliveries: sanitized,
    pagination: buildPagination(page, limit, total),
  };
}

/**
 * Paginated and filtered audit logs.
 */
async function listAuditLogs({ page = 1, limit = 20, action, targetType } = {}) {
  const where = {};
  if (action) where.action = { contains: action, mode: 'insensitive' };
  if (targetType) where.targetType = { contains: targetType, mode: 'insensitive' };

  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: buildPagination(page, limit, total),
  };
}

module.exports = {
  getDashboardStats,
  listUsers,
  updateUserAccountStatus,
  verifyNgoProfile,
  verifyDonorProfile,
  getVerificationHistory,
  listReports,
  reviewReport,
  listDonations,
  listDeliveries,
  listAuditLogs,
};
