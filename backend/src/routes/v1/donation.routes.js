const express = require('express');
const donationController = require('../../controllers/donation.controller');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { uploadDonationImage } = require('../../middleware/upload.middleware');
const {
  createDonationSchema,
  updateDonationSchema,
  browseDonationsQuerySchema,
  requestDonationSchema,
  respondToRequestSchema,
  reportDonationSchema,
} = require('../../validators/donation.validator');

const router = express.Router();

// All donation routes require authentication
router.use(authenticate);

// Donor routes
router.post(
  '/',
  authorize('DONOR'),
  uploadDonationImage.single('image'),
  validate({ body: createDonationSchema }),
  donationController.create
);

router.get('/my', authorize('DONOR'), donationController.getMyDonations);

router.patch(
  '/:id',
  authorize('DONOR'),
  uploadDonationImage.single('image'),
  validate({ body: updateDonationSchema }),
  donationController.update
);

router.patch('/:id/cancel', authorize('DONOR'), donationController.cancel);

router.patch(
  '/requests/:requestId',
  authorize('DONOR'),
  validate({ body: respondToRequestSchema }),
  donationController.respondToRequest
);

// NGO routes
router.get(
  '/',
  authorize('NGO', 'ADMIN'),
  validate({ query: browseDonationsQuerySchema }),
  donationController.browse
);

router.post(
  '/:id/requests',
  authorize('NGO'),
  validate({ body: requestDonationSchema }),
  donationController.request
);

// Any authenticated user (NGO, Volunteer, Donor) can report a donation for safety review
router.post(
  '/:id/report',
  authorize('DONOR', 'NGO', 'VOLUNTEER'),
  validate({ body: reportDonationSchema }),
  donationController.report
);

module.exports = router;
