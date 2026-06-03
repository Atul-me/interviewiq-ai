const mongoose = require('mongoose');

// Subdocument schema for a single question inside the interview session
const sessionQuestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: [true, 'Question content is required'],
  },
  category: {
    type: String,
    required: [true, 'Question category is required'],
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  userAnswer: {
    type: String,
    default: '',
  },
  evaluation: {
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
    feedback: {
      type: String,
    },
    exemplaryAnswer: {
      type: String,
    },
    improvementSuggestions: [
      {
        type: String,
      }
    ],
  },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An interview session must belong to a user'],
    },
    targetRole: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: 'Difficulty level must be: Easy, Medium, Hard',
      },
      required: [true, 'Difficulty level is required'],
    },
    status: {
      type: String,
      enum: ['started', 'completed'],
      default: 'started',
    },
    questions: [sessionQuestionSchema],
    overallScore: {
      type: Number,
      min: 0,
      max: 10,
    },
    overallFeedback: {
      type: String,
      trim: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Add index on user for fast retrieval of history
interviewSchema.index({ user: 1, createdAt: -1 });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
