const fs = require('fs');
const Interview = require('../models/interviewModel');
const aiService = require('../services/aiService');
const cacheService = require('../services/cacheService');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/customError');

/**
 * Helper to flush all user dashboard & history caches
 * @param {string} userId - Current user ID string
 */
const flushUserCaches = async (userId) => {
  try {
    await cacheService.flushPattern(`dashboard:${userId}:*`);
    await cacheService.flushPattern(`history:${userId}:*`);
  } catch (err) {
    // Non-blocking log, cache failures shouldn't crash API response
    console.error('Failed to flush user caches:', err);
  }
};

/**
 * @desc    Start a new mock interview session and generate AI questions
 * @route   POST /api/v1/interviews/start
 * @access  Private
 */
const startInterview = async (req, res, next) => {
  try {
    const { targetRole, difficulty, count } = req.body;
    const resumeText = req.user.resumeText || '';

    // Generate questions via Gemini AI
    const rawQuestions = await aiService.generateInterviewQuestions({
      targetRole,
      difficulty,
      resumeText,
      count
    });

    if (!rawQuestions || rawQuestions.length === 0) {
      return next(new AppError('Failed to generate interview questions. Please try again.', 502));
    }

    // Format questions array for MongoDB document embedding
    const formattedQuestions = rawQuestions.map((q) => ({
      id: q.id || `q-${Math.random().toString(36).substr(2, 9)}`,
      question: q.question,
      category: q.category || 'General',
      difficulty: q.difficulty || difficulty,
      userAnswer: '',
      evaluation: undefined,
    }));

    // Create session document in database
    const session = await Interview.create({
      user: req.user._id,
      targetRole,
      difficulty,
      questions: formattedQuestions,
    });

    // Invalidate caches
    await flushUserCaches(req.user._id.toString());

    return sendSuccess(res, 201, 'Interview session started successfully', {
      session: {
        id: session._id,
        targetRole: session.targetRole,
        difficulty: session.difficulty,
        status: session.status,
        startedAt: session.startedAt,
        questions: session.questions.map((q) => ({
          id: q.id,
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          userAnswer: q.userAnswer,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit an answer for a specific question, grade it in real-time, and store
 * @route   POST /api/v1/interviews/:id/submit-answer
 * @access  Private
 */
const submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionId, userAnswer } = req.body;

    // Find the session belonging to user
    const session = await Interview.findOne({ _id: id, user: req.user._id });
    if (!session) {
      return next(new AppError('Interview session not found', 404));
    }

    if (session.status === 'completed') {
      return next(new AppError('This interview session has already been completed', 400));
    }

    // Locate question subdocument
    const questionDoc = session.questions.find((q) => q.id === questionId);
    if (!questionDoc) {
      return next(new AppError('Question not found in this session', 404));
    }

    // Call AI service to evaluate answer
    const evaluation = await aiService.evaluateUserAnswer({
      question: questionDoc.question,
      userAnswer,
      targetRole: session.targetRole,
      difficulty: questionDoc.difficulty
    });

    // Save answer and evaluation on subdocument
    questionDoc.userAnswer = userAnswer;
    questionDoc.evaluation = {
      score: evaluation.score,
      feedback: evaluation.feedback,
      exemplaryAnswer: evaluation.exemplaryAnswer,
      improvementSuggestions: evaluation.improvementSuggestions,
    };

    // Save updated session document
    await session.save();

    // Invalidate caches
    await flushUserCaches(req.user._id.toString());

    return sendSuccess(res, 200, 'Answer submitted and graded successfully', {
      questionId,
      evaluation: questionDoc.evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit audio recording, transcribe via AI speech-to-text, and evaluate answer
 * @route   POST /api/v1/interviews/:id/submit-voice-answer
 * @access  Private
 */
const submitVoiceAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionId } = req.body;

    if (!req.file) {
      return next(new AppError('Please provide an audio recording file under the key "audio"', 400));
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // Find session belonging to current user
    const session = await Interview.findOne({ _id: id, user: req.user._id });
    if (!session) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return next(new AppError('Interview session not found', 404));
    }

    if (session.status === 'completed') {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return next(new AppError('This interview session has already been completed', 400));
    }

    // Locate question subdocument
    const questionDoc = session.questions.find((q) => q.id === questionId);
    if (!questionDoc) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return next(new AppError('Question not found in this session', 404));
    }

    // 1. Transcribe speech using Gemini multimodal SDK features
    const transcribedAnswerText = await aiService.transcribeAudio(filePath, mimeType);

    // 2. Grade transcription response using standard evaluation pipeline
    const evaluation = await aiService.evaluateUserAnswer({
      question: questionDoc.question,
      userAnswer: transcribedAnswerText,
      targetRole: session.targetRole,
      difficulty: questionDoc.difficulty
    });

    // Save answer and evaluation on subdocument
    questionDoc.userAnswer = transcribedAnswerText;
    questionDoc.evaluation = {
      score: evaluation.score,
      feedback: evaluation.feedback,
      exemplaryAnswer: evaluation.exemplaryAnswer,
      improvementSuggestions: evaluation.improvementSuggestions,
    };

    // Save updated session document
    await session.save();

    // Invalidate caches
    await flushUserCaches(req.user._id.toString());

    // Clean up uploaded audio recording from disk space
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return sendSuccess(res, 200, 'Voice answer transcribed and evaluated successfully', {
      questionId,
      transcribedText: transcribedAnswerText,
      evaluation: questionDoc.evaluation,
    });
  } catch (error) {
    // Ensure cleanup in case of execution failure
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * @desc    Mark interview session as completed and calculate overall summary
 * @route   POST /api/v1/interviews/:id/complete
 * @access  Private
 */
const completeInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await Interview.findOne({ _id: id, user: req.user._id });
    if (!session) {
      return next(new AppError('Interview session not found', 404));
    }

    if (session.status === 'completed') {
      return next(new AppError('Interview session is already completed', 400));
    }

    // Compute average score across questions
    let totalScore = 0;
    let answeredCount = 0;

    session.questions.forEach((q) => {
      if (q.evaluation && typeof q.evaluation.score === 'number') {
        totalScore += q.evaluation.score;
        answeredCount++;
      }
    });

    // Overall score scales to the total number of questions, penalizing unanswered ones
    const totalQuestions = session.questions.length;
    const overallScore = totalQuestions > 0 ? Number((totalScore / totalQuestions).toFixed(1)) : 0;

    // Generate dynamic simple summary text
    let overallFeedback = '';
    if (overallScore >= 8) {
      overallFeedback = `Excellent performance! You demonstrated outstanding technical proficiency for the role of ${session.targetRole}. Continue polishing edge cases.`;
    } else if (overallScore >= 6) {
      overallFeedback = `Good effort. You have a solid grasp of basic core concepts but need to add more depth, technical details, and clarity in your answers.`;
    } else {
      overallFeedback = `Significant preparation is needed. We recommend reviewing the exemplary answers and focusing heavily on technical fundamentals and communication structure.`;
    }

    // Update document lifecycle states
    session.status = 'completed';
    session.overallScore = overallScore;
    session.overallFeedback = overallFeedback;
    session.completedAt = Date.now();

    await session.save();

    // Invalidate caches
    await flushUserCaches(req.user._id.toString());

    return sendSuccess(res, 200, 'Interview session completed successfully', {
      session: {
        id: session._id,
        targetRole: session.targetRole,
        difficulty: session.difficulty,
        status: session.status,
        overallScore: session.overallScore,
        overallFeedback: session.overallFeedback,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        questions: session.questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's mock interview history
 * @route   GET /api/v1/interviews/history
 * @access  Private
 */
const getInterviewHistory = async (req, res, next) => {
  try {
    // Return sorted completed interview summaries
    const history = await Interview.find({ user: req.user._id })
      .select('targetRole difficulty status overallScore startedAt completedAt')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Interview history retrieved successfully', {
      history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get specific mock interview details (including questions and grades)
 * @route   GET /api/v1/interviews/:id
 * @access  Private
 */
const getInterviewDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await Interview.findOne({ _id: id, user: req.user._id });
    if (!session) {
      return next(new AppError('Interview session not found', 404));
    }

    return sendSuccess(res, 200, 'Interview details retrieved successfully', {
      session,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  submitVoiceAnswer,
  completeInterview,
  getInterviewHistory,
  getInterviewDetails,
};
