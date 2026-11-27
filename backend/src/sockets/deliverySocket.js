const { Server } = require('socket.io');
const environment = require('../config/environment');
const { prisma } = require('../config/database');
const { AUTH_COOKIE_NAME, verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');

let ioInstance = null;

function parseCookieHeader(cookieHeader = '') {
  const cookies = {};
  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rawVal] = part.trim().split('=');
    if (rawKey) {
      cookies[rawKey] = decodeURIComponent(rawVal.join('='));
    }
  }
  return cookies;
}

async function isUserAuthorizedForDelivery(user, deliveryId) {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: {
      donation: { select: { donorId: true } },
    },
  });

  if (!delivery) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role === 'DONOR' && user.donorProfile?.id === delivery.donation?.donorId) {
    return true;
  }
  if (user.role === 'NGO' && user.ngoProfile?.id === delivery.ngoId) {
    return true;
  }
  if (
    user.role === 'VOLUNTEER' &&
    user.volunteerProfile?.id === delivery.volunteerId
  ) {
    return true;
  }
  return false;
}

function initializeSocketIO(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: environment.clientUrl,
      credentials: true,
    },
  });

  ioInstance.use(async (socket, next) => {
    try {
      const cookies = parseCookieHeader(socket.handshake.headers?.cookie || '');
      const token =
        socket.handshake.auth?.token || cookies[AUTH_COOKIE_NAME] || null;

      if (!token) {
        return next(new Error('Authentication required for real-time tracking'));
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

      if (!user || !user.isActive) {
        return next(new Error('User account is invalid or deactivated'));
      }

      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error('Invalid authentication token'));
    }
  });

  ioInstance.on('connection', (socket) => {
    // Join personal room for real-time notifications
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    socket.on('delivery:join', async ({ deliveryId }) => {
      try {
        if (!deliveryId) return;
        const allowed = await isUserAuthorizedForDelivery(socket.user, deliveryId);
        if (!allowed) {
          socket.emit('delivery:error', {
            message: 'Access denied. You are not authorized to track this delivery.',
          });
          return;
        }
        socket.join(`delivery:${deliveryId}`);
        socket.emit('delivery:joined', { deliveryId });
      } catch (error) {
        logger.error('Socket delivery:join error', error);
        socket.emit('delivery:error', { message: 'Failed to join delivery room.' });
      }
    });

    socket.on('delivery:leave', ({ deliveryId }) => {
      if (deliveryId) {
        socket.leave(`delivery:${deliveryId}`);
      }
    });
  });

  logger.info('Socket.IO real-time delivery tracking initialized.');
  return ioInstance;
}

function emitDeliveryStatus(deliveryId, payload) {
  if (ioInstance) {
    ioInstance.to(`delivery:${deliveryId}`).emit('delivery:status_updated', payload);
  }
}

function emitVolunteerLocation(deliveryId, payload) {
  if (ioInstance) {
    ioInstance.to(`delivery:${deliveryId}`).emit('delivery:location_updated', payload);
  }
}

function emitLocationStopped(deliveryId) {
  if (ioInstance) {
    ioInstance.to(`delivery:${deliveryId}`).emit('delivery:location_stopped', {
      deliveryId,
      isLocationSharing: false,
      stoppedAt: new Date().toISOString(),
    });
  }
}

function emitUserNotification(userId, notification) {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit('notification:new', notification);
  }
}

module.exports = {
  initializeSocketIO,
  emitDeliveryStatus,
  emitVolunteerLocation,
  emitLocationStopped,
  emitUserNotification,
};
