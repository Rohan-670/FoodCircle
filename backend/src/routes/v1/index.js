const express = require('express');
const healthRoutes = require('./health.routes');

const router = express.Router();

// Mount v1 API routes
router.use('/health', healthRoutes);

module.exports = router;
