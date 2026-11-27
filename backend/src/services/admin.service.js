const { prisma } = require('../config/database');
const { sanitizeUser } = require('../utils/userSerializer');
const AppError = require('../utils/AppError');

async function listUsers() {
  const users = await prisma.user.findMany({
    include: {
      donorProfile: true,
      ngoProfile: true,
      volunteerProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map(sanitizeUser);
}

async function updateUserAccountStatus(targetUserId, isActive, currentAdminId) {
  if (targetUserId === currentAdminId && !isActive) {
    throw new AppError('Administrators cannot deactivate their own account.', 400);
  }

  const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!existing) {
    throw new AppError('User not found.', 404);
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive },
    include: {
      donorProfile: true,
      ngoProfile: true,
      volunteerProfile: true,
    },
  });

  return sanitizeUser(updated);
}

async function verifyNgoProfile(ngoId, isVerified) {
  const existing = await prisma.nGOProfile.findUnique({ where: { id: ngoId } });
  if (!existing) {
    throw new AppError('NGO profile not found.', 404);
  }

  return prisma.nGOProfile.update({
    where: { id: ngoId },
    data: { isVerified },
  });
}

module.exports = {
  listUsers,
  updateUserAccountStatus,
  verifyNgoProfile,
};
