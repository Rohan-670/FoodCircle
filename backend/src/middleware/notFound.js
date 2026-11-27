const { sendError } = require('../utils/response');

/**
 * 404 handler for routes that do not match any defined endpoint
 */
function notFoundHandler(req, res, next) {
  return sendError(
    res,
    404,
    `Route not found: ${req.method} ${req.originalUrl}`
  );
}

module.exports = notFoundHandler;
