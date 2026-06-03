const express = require('express');
const { generateQuestions, evaluateAnswer } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { generateQuestionsSchema, evaluateAnswerSchema } = require('../validations/aiValidation');

const router = express.Router();

// Require protection (JWT Bearer Token verification) on all AI routes
router.use(protect);

// Endpoint to generate questions based on role, difficulty, and resume
router.post('/generate-questions', validate(generateQuestionsSchema), generateQuestions);

// Endpoint to grade and evaluate a specific answer
router.post('/evaluate-answer', validate(evaluateAnswerSchema), evaluateAnswer);

module.exports = router;
