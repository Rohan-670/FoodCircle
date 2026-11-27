const express = require('express');
const healthController = require('../controllers/health.controller');

const router = express.Router();

// GET /api/health - Health check endpoint
router.get('/', healthController.checkHealth);

module.exports = router;
