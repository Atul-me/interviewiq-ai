const Joi = require('joi');

/**
 * Validation rules for user registration
 */
const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.base': 'Name must be a text value',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is a required field',
    }),
  
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .messages({
      'string.base': 'Email must be a text value',
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email cannot be empty',
      'any.required': 'Email is a required field',
    }),
  
  password: Joi.string()
    .min(6)
    .max(30)
    .required()
    .messages({
      'string.base': 'Password must be a text value',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 30 characters',
      'any.required': 'Password is a required field',
    }),
  
  targetRole: Joi.string()
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.base': 'Target role must be a text value',
    }),
});

/**
 * Validation rules for user login
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email cannot be empty',
      'any.required': 'Email is a required field',
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password cannot be empty',
      'any.required': 'Password is a required field',
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
