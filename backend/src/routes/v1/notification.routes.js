const express = require('express');
const notificationController = require('../../controllers/notification.controller');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth.middleware');
const {
  listNotificationsQuerySchema,
  updatePreferencesSchema,
} = require('../../validators/notification.validator');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  validate({ query: listNotificationsQuerySchema }),
  notificationController.list
);
router.get('/unread-count', notificationController.unreadCount);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

router.get('/preferences', notificationController.getPreferences);
router.patch(
  '/preferences',
  validate({ body: updatePreferencesSchema }),
  notificationController.updatePreferences
);

module.exports = router;
