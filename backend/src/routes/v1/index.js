const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const donationRoutes = require('./donation.routes');
const matchingRoutes = require('./matching.routes');

const router = express.Router();

// Mount v1 API routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/donations', donationRoutes);
router.use('/recommendations', matchingRoutes);

module.exports = router;
