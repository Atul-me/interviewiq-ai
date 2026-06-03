const express = require('express');
const { uploadResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Protected upload endpoint: expects multipart form-data containing single 'resume' file
router.post('/upload', protect, upload.single('resume'), uploadResume);

module.exports = router;
