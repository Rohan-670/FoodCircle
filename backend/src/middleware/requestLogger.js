const logger = require('../utils/logger');

/**
 * Middleware to log every incoming HTTP request and its response time.
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    logger.http(req.method, req.originalUrl, res.statusCode, durationMs);
  });

  next();
}

module.exports = requestLogger;
