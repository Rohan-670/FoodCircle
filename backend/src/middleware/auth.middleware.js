const { prisma } = require('../config/database');
const { AUTH_COOKIE_NAME, verifyToken } = require('../utils/jwt');
const { sanitizeUser } = require('../utils/userSerializer');
const AppError = require('../utils/AppError');

/**
 * Extract JWT from HTTP-only cookie or Authorization Bearer header.
 */
function extractToken(req) {
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
}

/**
 * Authentication middleware.
 * Verifies JWT, loads the user from PostgreSQL, checks account active status,
 * and attaches the sanitized user object to req.user.
 */
async function authenticate(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        donorProfile: true,
        ngoProfile: true,
        volunteerProfile: true,
      },
    });

    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(
        new AppError('Account is deactivated. Please contact an administrator.', 403)
      );
    }

    req.user = sanitizeUser(user);
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Role-based authorization middleware factory.
 * Restricts access to users whose role is included in allowedRoles.
 *
 * @param  {...string} allowedRoles - e.g. 'ADMIN', 'DONOR', 'NGO', 'VOLUNTEER'
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
          403
        )
      );
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
