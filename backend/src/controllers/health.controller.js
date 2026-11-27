const healthService = require('../services/health.service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Controller to handle API and database health check requests.
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next middleware
 */
async function checkHealth(req, res, next) {
  try {
    const healthData = await healthService.getSystemHealth();

    if (healthData.database.status === 'connected') {
      return sendSuccess(res, 200, 'Server and database are healthy', healthData);
    }

    return sendError(
      res,
      503,
      'Server is running, but database connection is unavailable',
      healthData
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  checkHealth,
};
