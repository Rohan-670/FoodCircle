const express = require('express');
const healthController = require('../../controllers/health.controller');

const router = express.Router();

// GET /api/v1/health - Health check endpoint (includes PostgreSQL status)
router.get('/', healthController.checkHealth);

module.exports = router;
