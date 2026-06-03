const AppError = require('../utils/customError');

/**
 * Express middleware to validate request bodies against a Joi schema.
 * Automatically strips unknown parameters for extra parameter pollution security.
 * @param {import('joi').Schema} schema - Joi validation schema
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,  // Report all validation errors rather than exiting on first
    stripUnknown: true, // Strip out any unknown keys from input to block tampering
  });

  if (error) {
    const errorDetails = error.details.map((detail) => detail.message).join('. ');
    return next(new AppError(errorDetails, 400));
  }

  // Replace request body with purified, validated data
  req.body = value;
  next();
};

module.exports = validate;
