const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { sanitizeUser } = require('../utils/userSerializer');
const AppError = require('../utils/AppError');

/**
 * Register a new DONOR, NGO, or VOLUNTEER user with role-specific profile.
 * Admin registration is strictly blocked on public signup.
 */
async function registerUser(data) {
  if (data.role === 'ADMIN') {
    throw new AppError(
      'Administrator accounts cannot be created via public registration.',
      403
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await hashPassword(data.password);

  const createdUser = await prisma.$transaction(async (tx) => {
    const fullName =
      data.role === 'NGO' ? data.contactPerson : data.fullName;

    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName,
        phone: data.phone,
        role: data.role,
        isActive: true,
      },
    });

    if (data.role === 'DONOR') {
      await tx.donorProfile.create({
        data: {
          userId: user.id,
          organizationName: data.organizationName,
          businessType: data.businessType || 'General',
          address: data.address,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
        },
      });
    } else if (data.role === 'NGO') {
      await tx.nGOProfile.create({
        data: {
          userId: user.id,
          organizationName: data.organizationName,
          contactPerson: data.contactPerson,
          registrationNumber: data.registrationNumber || null,
          address: data.address,
          serviceArea: data.serviceArea,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          capacity: data.capacity ?? null,
          isVerified: false, // Always unverified on initial registration
        },
      });
    } else if (data.role === 'VOLUNTEER') {
      await tx.volunteerProfile.create({
        data: {
          userId: user.id,
          address: data.address || null,
          serviceArea: data.serviceArea || null,
          vehicleType: data.vehicleType || null,
          isAvailable: data.isAvailable ?? true,
          currentLatitude: data.currentLatitude ?? null,
          currentLongitude: data.currentLongitude ?? null,
        },
      });
    }

    return tx.user.findUnique({
      where: { id: user.id },
      include: {
        donorProfile: true,
        ngoProfile: true,
        volunteerProfile: true,
      },
    });
  });

  const token = signToken({ userId: createdUser.id, role: createdUser.role });

  return {
    user: sanitizeUser(createdUser),
    token,
  };
}

/**
 * Authenticate an existing user by email and password.
 */
async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      donorProfile: true,
      ngoProfile: true,
      volunteerProfile: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError(
      'Account is deactivated. Please contact an administrator.',
      403
    );
  }

  const token = signToken({ userId: user.id, role: user.role });

  return {
    user: sanitizeUser(user),
    token,
  };
}

/**
 * Retrieve the authenticated user's profile.
 */
async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      donorProfile: true,
      ngoProfile: true,
      volunteerProfile: true,
    },
  });

  if (!user) {
    throw new AppError('User profile not found.', 404);
  }

  return sanitizeUser(user);
}

/**
 * Update only the authenticated user's own account & role-specific profile.
 */
async function updateProfile(userId, role, updates) {
  const updatedUser = await prisma.$transaction(async (tx) => {
    const userUpdates = {};
    if (updates.fullName !== undefined) userUpdates.fullName = updates.fullName;
    if (updates.phone !== undefined) userUpdates.phone = updates.phone;

    if (Object.keys(userUpdates).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: userUpdates,
      });
    }

    if (role === 'DONOR') {
      const donorUpdates = {};
      if (updates.organizationName !== undefined)
        donorUpdates.organizationName = updates.organizationName;
      if (updates.businessType !== undefined)
        donorUpdates.businessType = updates.businessType;
      if (updates.address !== undefined) donorUpdates.address = updates.address;
      if (updates.latitude !== undefined) donorUpdates.latitude = updates.latitude;
      if (updates.longitude !== undefined) donorUpdates.longitude = updates.longitude;

      if (Object.keys(donorUpdates).length > 0) {
        await tx.donorProfile.update({
          where: { userId },
          data: donorUpdates,
        });
      }
    } else if (role === 'NGO') {
      const ngoUpdates = {};
      if (updates.organizationName !== undefined)
        ngoUpdates.organizationName = updates.organizationName;
      if (updates.contactPerson !== undefined)
        ngoUpdates.contactPerson = updates.contactPerson;
      if (updates.registrationNumber !== undefined)
        ngoUpdates.registrationNumber = updates.registrationNumber;
      if (updates.address !== undefined) ngoUpdates.address = updates.address;
      if (updates.serviceArea !== undefined)
        ngoUpdates.serviceArea = updates.serviceArea;
      if (updates.latitude !== undefined) ngoUpdates.latitude = updates.latitude;
      if (updates.longitude !== undefined) ngoUpdates.longitude = updates.longitude;
      if (updates.capacity !== undefined) ngoUpdates.capacity = updates.capacity;

      if (Object.keys(ngoUpdates).length > 0) {
        await tx.nGOProfile.update({
          where: { userId },
          data: ngoUpdates,
        });
      }
    } else if (role === 'VOLUNTEER') {
      const volunteerUpdates = {};
      if (updates.address !== undefined) volunteerUpdates.address = updates.address;
      if (updates.serviceArea !== undefined)
        volunteerUpdates.serviceArea = updates.serviceArea;
      if (updates.vehicleType !== undefined)
        volunteerUpdates.vehicleType = updates.vehicleType;
      if (updates.isAvailable !== undefined)
        volunteerUpdates.isAvailable = updates.isAvailable;
      if (updates.currentLatitude !== undefined)
        volunteerUpdates.currentLatitude = updates.currentLatitude;
      if (updates.currentLongitude !== undefined)
        volunteerUpdates.currentLongitude = updates.currentLongitude;

      if (Object.keys(volunteerUpdates).length > 0) {
        await tx.volunteerProfile.update({
          where: { userId },
          data: volunteerUpdates,
        });
      }
    }

    return tx.user.findUnique({
      where: { id: userId },
      include: {
        donorProfile: true,
        ngoProfile: true,
        volunteerProfile: true,
      },
    });
  });

  return sanitizeUser(updatedUser);
}

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
};
