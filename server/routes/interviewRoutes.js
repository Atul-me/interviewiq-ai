const express = require('express');
const {
  startInterview,
  submitAnswer,
  submitVoiceAnswer,
  completeInterview,
  getInterviewHistory,
  getInterviewDetails,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const uploadAudio = require('../middleware/audioUploadMiddleware');
const {
  startInterviewSchema,
  submitAnswerSchema,
  submitVoiceSchema,
} = require('../validations/interviewValidation');

const router = express.Router();

// Require protection (JWT Bearer validation) for all interview routes
router.use(protect);

// Start an interview session
router.post('/start', validate(startInterviewSchema), startInterview);

// Submit and grade a question answer
router.post('/:id/submit-answer', validate(submitAnswerSchema), submitAnswer);

// Submit voice recording, transcribe, and grade answer
router.post('/:id/submit-voice-answer', uploadAudio.single('audio'), validate(submitVoiceSchema), submitVoiceAnswer);

// Finalize and close the interview session
router.post('/:id/complete', completeInterview);

// Retrieve all historical sessions
router.get('/history', getInterviewHistory);

// Retrieve full detailed scorecard of a single session
router.get('/:id', getInterviewDetails);

module.exports = router;
