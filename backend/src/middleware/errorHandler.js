const { sendError } = require('../utils/response');
const environment = require('../config/environment');

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('Unhandled Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred';

  // Only expose stack trace in development mode
  const errors = environment.nodeEnv === 'development' ? { stack: err.stack } : null;

  return sendError(res, statusCode, message, errors);
}

module.exports = errorHandler;
