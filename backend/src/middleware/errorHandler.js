const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const { sendError } = require('../utils/response');
const AppError = require('../utils/AppError');
const environment = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Map Prisma known request errors to clean HTTP status codes and messages.
 */
function handlePrismaError(err) {
  switch (err.code) {
    case 'P2002':
      return {
        statusCode: 409,
        message: 'A record with this unique value already exists.',
        errors: err.meta?.target ? [{ field: err.meta.target, message: 'Must be unique' }] : null,
      };
    case 'P2025':
      return {
        statusCode: 404,
        message: 'Requested record was not found.',
        errors: null,
      };
    case 'P2003':
      return {
        statusCode: 400,
        message: 'Invalid reference: related record does not exist.',
        errors: null,
      };
    default:
      return {
        statusCode: 400,
        message: 'Database request failed.',
        errors: null,
      };
  }
}

/**
 * Centralized error-handling middleware.
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected internal server error occurred';
  let errors = err.errors || null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.') || 'request',
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = handlePrismaError(err);
    statusCode = mapped.statusCode;
    message = mapped.message;
    errors = mapped.errors;
  } else if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError
  ) {
    statusCode = 503;
    message = 'Database service is currently unavailable.';
    errors = null;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
    errors = null;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
    errors = null;
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded image exceeds the maximum allowed size of 5 MB.'
        : `File upload error: ${err.message}`;
    errors = null;
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON payload in request body.';
    errors = null;
  }

  // Log server/unexpected errors without leaking sensitive details to clients
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} [${statusCode}] - ${message}`, err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} [${statusCode}] - ${message}`);
  }

  if (environment.nodeEnv === 'development' && statusCode >= 500 && !errors) {
    errors = { stack: err.stack };
  }

  return sendError(res, statusCode, message, errors);
}

module.exports = errorHandler;
