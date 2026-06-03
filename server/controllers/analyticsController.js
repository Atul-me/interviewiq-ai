const mongoose = require('mongoose');
const Interview = require('../models/interviewModel');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * @desc    Get user interview preparation stats and analytics
 * @route   GET /api/v1/analytics/dashboard
 * @access  Private
 */
const getUserDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Overview Metrics (Total Completed, Avg Score)
    const overviewStats = await Interview.aggregate([
      { $match: { user: userId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          avgScore: { $avg: '$overallScore' },
        },
      },
    ]);

    // 2. Category Performance (Group by category, calculate avg score and questions count)
    const categoryStats = await Interview.aggregate([
      { $match: { user: userId, status: 'completed' } },
      { $unwind: '$questions' },
      { $match: { 'questions.evaluation.score': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$questions.category',
          avgScore: { $avg: '$questions.evaluation.score' },
          questionCount: { $sum: 1 },
        },
      },
      { $sort: { avgScore: -1 } },
    ]);

    // 3. Progress Timeline (Scores sorted by completion time)
    const timelineStats = await Interview.aggregate([
      { $match: { user: userId, status: 'completed' } },
      {
        $project: {
          _id: 1,
          targetRole: 1,
          difficulty: 1,
          overallScore: 1,
          completedAt: 1,
        },
      },
      { $sort: { completedAt: 1 } },
    ]);

    // 4. Difficulty breakdown
    const difficultyStats = await Interview.aggregate([
      { $match: { user: userId, status: 'completed' } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format metrics into a neat response structure
    const totalInterviews = overviewStats.length > 0 ? overviewStats[0].totalInterviews : 0;
    const avgScore = overviewStats.length > 0 ? Number(overviewStats[0].avgScore.toFixed(1)) : 0;

    // Process strengths and weaknesses recommendations
    const strengths = [];
    const weaknesses = [];

    categoryStats.forEach((cat) => {
      const score = Number(cat.avgScore.toFixed(1));
      const categoryData = { category: cat._id, score, count: cat.questionCount };
      if (score >= 7.5) {
        strengths.push(categoryData);
      } else {
        weaknesses.push(categoryData);
      }
    });

    // Provide default recommendations if stats exist
    let advice = 'Start taking mock interviews to build your profile recommendations.';
    if (totalInterviews > 0) {
      if (weaknesses.length > 0) {
        advice = `Focus on improving your skills in the following areas: ${weaknesses.map((w) => w.category).join(', ')}. Review the exemplary answers in your feedback scorecard.`;
      } else {
        advice = 'Excellent performance across all categories! Try taking Hard difficulty mock interviews to push your limits.';
      }
    }

    return sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', {
      overview: {
        totalInterviews,
        avgScore,
        totalQuestionsAnswered: categoryStats.reduce((sum, cat) => sum + cat.questionCount, 0),
      },
      categories: categoryStats.map((cat) => ({
        category: cat._id,
        avgScore: Number(cat.avgScore.toFixed(1)),
        questionCount: cat.questionCount,
      })),
      timeline: timelineStats,
      difficulty: {
        Easy: difficultyStats.find((d) => d._id === 'Easy')?.count || 0,
        Medium: difficultyStats.find((d) => d._id === 'Medium')?.count || 0,
        Hard: difficultyStats.find((d) => d._id === 'Hard')?.count || 0,
      },
      recommendations: {
        strengths,
        weaknesses,
        advice,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserDashboardStats,
};
