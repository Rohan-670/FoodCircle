const express = require('express');
const healthRoutes = require('./health.routes');

const router = express.Router();

// Mount individual route modules
router.use('/health', healthRoutes);

module.exports = router;
