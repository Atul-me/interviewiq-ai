const Joi = require('joi');

/**
 * Validation rules for starting a new interview session
 */
const startInterviewSchema = Joi.object({
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
 * Validation rules for submitting an answer to a question in a session
 */
const submitAnswerSchema = Joi.object({
  questionId: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Question ID must be a text value',
      'string.empty': 'Question ID cannot be empty',
      'any.required': 'Question ID is a required field',
    }),

  userAnswer: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'User answer must be a text value',
      'string.empty': 'Answer cannot be empty',
      'any.required': 'User answer is a required field',
    }),
});

/**
 * Validation rules for voice answer uploads
 */
const submitVoiceSchema = Joi.object({
  questionId: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Question ID must be a text value',
      'string.empty': 'Question ID cannot be empty',
      'any.required': 'Question ID is a required field',
    }),
});

module.exports = {
  startInterviewSchema,
  submitAnswerSchema,
  submitVoiceSchema,
};
