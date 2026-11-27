const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/response');

async function list(req, res, next) {
  try {
    const result = await notificationService.listUserNotifications(
      req.user.id,
      req.query
    );
    return sendSuccess(res, 200, 'Notifications retrieved', result);
  } catch (error) {
    return next(error);
  }
}

async function unreadCount(req, res, next) {
  try {
    const result = await notificationService.getUnreadCount(req.user.id);
    return sendSuccess(res, 200, 'Unread notification count retrieved', result);
  } catch (error) {
    return next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(
      req.user.id,
      req.params.id
    );
    return sendSuccess(res, 200, 'Notification marked as read', { notification });
  } catch (error) {
    return next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    return sendSuccess(res, 200, 'All notifications marked as read', result);
  } catch (error) {
    return next(error);
  }
}

async function getPreferences(req, res, next) {
  try {
    const result = await notificationService.getPreferences(req.user.id);
    return sendSuccess(res, 200, 'Notification preferences retrieved', result);
  } catch (error) {
    return next(error);
  }
}

async function updatePreferences(req, res, next) {
  try {
    const result = await notificationService.updatePreferences(
      req.user.id,
      req.body
    );
    return sendSuccess(res, 200, 'Notification preferences updated', result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  unreadCount,
  markRead,
  markAllRead,
  getPreferences,
  updatePreferences,
};
