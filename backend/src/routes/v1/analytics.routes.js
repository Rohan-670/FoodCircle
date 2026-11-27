const express = require('express');
const analyticsController = require('../../controllers/analytics.controller');

const router = express.Router();

// Public impact analytics endpoint (returns aggregate counts/totals only, no private user data)
router.get('/impact', analyticsController.getImpact);

module.exports = router;
