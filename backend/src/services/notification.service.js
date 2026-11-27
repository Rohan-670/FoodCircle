const { prisma } = require('../config/database');
const { emitUserNotification } = require('../sockets/deliverySocket');
const AppError = require('../utils/AppError');

const DEFAULT_PREFERENCES = {
  requestAlerts: true,
  deliveryAlerts: true,
  expiryAlerts: true,
  verificationAlerts: true,
};

const TYPE_TO_PREF_KEY = {
  REQUEST_RECEIVED: 'requestAlerts',
  REQUEST_APPROVED: 'requestAlerts',
  REQUEST_REJECTED: 'requestAlerts',
  RECOMMENDATION_INVITE: 'requestAlerts',
  DELIVERY_ASSIGNED: 'deliveryAlerts',
  PICKUP_CONFIRMED: 'deliveryAlerts',
  DELIVERY_STARTED: 'deliveryAlerts',
  DELIVERY_COMPLETED: 'deliveryAlerts',
  DONATION_EXPIRING_SOON: 'expiryAlerts',
  VERIFICATION_RESULT: 'verificationAlerts',
};

function mergePreferences(rawPrefs) {
  return {
    ...DEFAULT_PREFERENCES,
    ...(rawPrefs && typeof rawPrefs === 'object' ? rawPrefs : {}),
  };
}

/**
 * Create a persistent notification in PostgreSQL and emit it in real time via Socket.IO.
 * Respects the recipient's notification preferences.
 */
async function createNotification(
  { userId, type, title, message },
  txOrPrisma = prisma
) {
  if (!userId || !txOrPrisma?.notification?.create) {
    return null;
  }

  const prefKey = TYPE_TO_PREF_KEY[type];
  if (prefKey && txOrPrisma.user?.findUnique) {
    const user = await txOrPrisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true },
    });
    const prefs = mergePreferences(user?.notificationPreferences);
    if (!prefs[prefKey]) {
      return null; // User opted out of this notification category
    }
  }

  const notification = await txOrPrisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      isRead: false,
    },
  });

  emitUserNotification(userId, notification);
  return notification;
}

async function listUserNotifications(
  userId,
  { page = 1, limit = 20, unreadOnly = false } = {}
) {
  const where = { userId };
  if (unreadOnly) {
    where.isRead = false;
  }

  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

async function getUnreadCount(userId) {
  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { unreadCount };
}

async function markAsRead(userId, notificationId) {
  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!existing) {
    throw new AppError('Notification not found.', 404);
  }

  if (existing.userId !== userId) {
    throw new AppError('Access denied to this notification.', 403);
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

async function markAllAsRead(userId) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { markedCount: result.count };
}

async function getPreferences(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationPreferences: true },
  });
  return { preferences: mergePreferences(user?.notificationPreferences) };
}

async function updatePreferences(userId, updates) {
  const current = await getPreferences(userId);
  const nextPrefs = {
    ...current.preferences,
    ...updates,
  };

  await prisma.user.update({
    where: { id: userId },
    data: { notificationPreferences: nextPrefs },
  });

  return { preferences: nextPrefs };
}

module.exports = {
  DEFAULT_PREFERENCES,
  createNotification,
  listUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
};
