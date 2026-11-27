const healthService = require('../services/health.service');
const { sendSuccess } = require('../utils/response');

/**
 * Controller to handle API health check requests
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function checkHealth(req, res) {
  const healthData = healthService.getSystemHealth();
  return sendSuccess(res, 200, 'Server is running and healthy', healthData);
}

module.exports = {
  checkHealth,
};
