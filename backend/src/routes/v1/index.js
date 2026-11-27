const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const donationRoutes = require('./donation.routes');
const matchingRoutes = require('./matching.routes');
const deliveryRoutes = require('./delivery.routes');
const notificationRoutes = require('./notification.routes');
const dashboardRoutes = require('./dashboard.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

// Mount v1 API routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/donations', donationRoutes);
router.use('/recommendations', matchingRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboards', dashboardRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
