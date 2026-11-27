const express = require('express');
const deliveryController = require('../../controllers/delivery.controller');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const {
  requestVolunteerSchema,
  qrTokenSchema,
  locationUpdateSchema,
} = require('../../validators/delivery.validator');

const router = express.Router();

router.use(authenticate);

// NGO requests a volunteer for an ACCEPTED donation
router.post(
  '/donations/:donationId/request-volunteer',
  authorize('NGO'),
  validate({ body: requestVolunteerSchema }),
  deliveryController.requestVolunteer
);

// Volunteers browse available tasks
router.get('/available', authorize('VOLUNTEER'), deliveryController.listAvailable);

// Authorized users view their own deliveries
router.get('/my', deliveryController.listMyDeliveries);

// Volunteer accepts an available task
router.post('/:deliveryId/accept', authorize('VOLUNTEER'), deliveryController.acceptTask);

// Authorized Donor, NGO, Volunteer, or Admin views delivery details & route
router.get('/:deliveryId', deliveryController.getById);
router.get('/:deliveryId/route', deliveryController.getRoute);

// Volunteer live location sharing (with consent) & stop sharing
router.post(
  '/:deliveryId/location',
  authorize('VOLUNTEER'),
  validate({ body: locationUpdateSchema }),
  deliveryController.updateLocation
);
router.post(
  '/:deliveryId/location/stop',
  authorize('VOLUNTEER'),
  deliveryController.stopLocation
);

// QR-based pickup, transit, and delivery confirmation
router.post(
  '/:deliveryId/confirm-pickup',
  authorize('VOLUNTEER'),
  validate({ body: qrTokenSchema }),
  deliveryController.confirmPickup
);
router.post(
  '/:deliveryId/start-transit',
  authorize('VOLUNTEER'),
  deliveryController.startTransit
);
router.post(
  '/:deliveryId/confirm-delivery',
  authorize('VOLUNTEER'),
  validate({ body: qrTokenSchema }),
  deliveryController.confirmDelivery
);

// Cancel delivery (NGO or Admin)
router.patch(
  '/:deliveryId/cancel',
  authorize('NGO', 'ADMIN'),
  deliveryController.cancel
);

module.exports = router;
