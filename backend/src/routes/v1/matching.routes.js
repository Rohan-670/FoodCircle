const express = require('express');
const matchingController = require('../../controllers/matching.controller');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const {
  recommendationFilterQuerySchema,
  recommendationActionSchema,
} = require('../../validators/matching.validator');

const router = express.Router();

router.use(authenticate);

// Donor views recommended NGOs for a specific donation
router.get(
  '/donations/:donationId/ngos',
  authorize('DONOR'),
  validate({ query: recommendationFilterQuerySchema }),
  matchingController.getNgosForDonation
);

// NGO views recommended donations
router.get(
  '/ngos/donations',
  authorize('NGO'),
  validate({ query: recommendationFilterQuerySchema }),
  matchingController.getDonationsForNgo
);

// Donor or NGO accepts (initiates request/invite) or ignores a recommendation
router.post(
  '/actions',
  authorize('DONOR', 'NGO'),
  validate({ body: recommendationActionSchema }),
  matchingController.respondToRecommendation
);

module.exports = router;
