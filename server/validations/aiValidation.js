const Joi = require('joi');

/**
 * Validation rules for generating questions request
 */
const generateQuestionsSchema = Joi.object({
  targetRole: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'Target role must be a text value',
      'string.empty': 'Target role cannot be empty',
      'string.min': 'Target role must be at least 2 characters long',
      'string.max': 'Target role cannot exceed 100 characters',
      'any.required': 'Target role is a required field',
    }),

  difficulty: Joi.string()
    .valid('Easy', 'Medium', 'Hard')
    .required()
    .messages({
      'any.only': 'Difficulty level must be one of: Easy, Medium, Hard',
      'any.required': 'Difficulty level is a required field',
    }),

  count: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .default(5)
    .optional()
    .messages({
      'number.base': 'Count must be a number',
      'number.integer': 'Count must be an integer',
      'number.min': 'Count must be at least 1 question',
      'number.max': 'Count cannot exceed 10 questions',
    }),
});

/**
 * Validation rules for answer evaluation request
 */
const evaluateAnswerSchema = Joi.object({
  question: Joi.string()
    .trim()
    .min(5)
    .required()
    .messages({
      'string.base': 'Question must be a text value',
      'string.empty': 'Question cannot be empty',
      'string.min': 'Question must be at least 5 characters long',
      'any.required': 'Question is a required field',
    }),

  userAnswer: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Answer must be a text value',
      'string.empty': 'Answer cannot be empty',
      'any.required': 'Answer is a required field',
    }),

  targetRole: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.base': 'Target role must be a text value',
      'string.max': 'Target role cannot exceed 100 characters',
    }),

  difficulty: Joi.string()
    .valid('Easy', 'Medium', 'Hard')
    .optional()
    .messages({
      'any.only': 'Difficulty level must be one of: Easy, Medium, Hard',
    }),
});

module.exports = {
  generateQuestionsSchema,
  evaluateAnswerSchema,
};
