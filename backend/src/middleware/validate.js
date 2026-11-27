const { ZodError } = require('zod');
const AppError = require('../utils/AppError');

/**
 * Request validation middleware using Zod schemas.
 * Validates req.body, req.query, and/or req.params as configured.
 *
 * @param {{ body?: import('zod').ZodSchema, query?: import('zod').ZodSchema, params?: import('zod').ZodSchema }} schemas
 */
function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join('.') || 'request',
          message: issue.message,
        }));
        return next(new AppError('Validation failed', 400, formattedErrors));
      }
      return next(error);
    }
  };
}

module.exports = validate;
