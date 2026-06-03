const aiService = require('../services/aiService');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/customError');

/**
 * @desc    Generate AI Interview Questions based on role, difficulty, and resume
 * @route   POST /api/v1/ai/generate-questions
 * @access  Private
 */
const generateQuestions = async (req, res, next) => {
  try {
    const { targetRole, difficulty, count } = req.body;
    
    // Save targetRole to user's profile if it has changed or is empty
    if (req.user.targetRole !== targetRole) {
      req.user.targetRole = targetRole;
      await req.user.save();
    }

    // Retrieve resume text if candidate has uploaded one
    const resumeText = req.user.resumeText || '';

    // Generate questions using Gemini Service
    const questions = await aiService.generateInterviewQuestions({
      targetRole,
      difficulty,
      resumeText,
      count
    });

    return sendSuccess(res, 200, 'Questions generated successfully', {
      targetRole,
      difficulty,
      questions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Evaluate a candidate's answer to an interview question
 * @route   POST /api/v1/ai/evaluate-answer
 * @access  Private
 */
const evaluateAnswer = async (req, res, next) => {
  try {
    const { question, userAnswer, targetRole, difficulty } = req.body;

    // Use provided targetRole/difficulty or fall back to user profile/defaults
    const resolvedRole = targetRole || req.user.targetRole || 'Software Engineer';
    const resolvedDifficulty = difficulty || 'Medium';

    // Get grading, exemplary answer, and feedback from Gemini Service
    const evaluation = await aiService.evaluateUserAnswer({
      question,
      userAnswer,
      targetRole: resolvedRole,
      difficulty: resolvedDifficulty
    });

    return sendSuccess(res, 200, 'Answer evaluated successfully', {
      question,
      evaluation
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQuestions,
  evaluateAnswer
};
