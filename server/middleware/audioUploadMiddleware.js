const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/customError');

// Define directory pathway for storing audio answers
const audioDir = path.join(__dirname, '..', 'uploads', 'audio');

// Dynamically generate directory structure on bootstrap if absent
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Configure storage strategy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name format: audio-userId-timestamp.extension
    const userId = req.user ? req.user._id : 'anonymous';
    const extension = path.extname(file.originalname).toLowerCase() || '.webm'; // default to .webm
    cb(null, `audio-${userId}-${Date.now()}${extension}`);
  },
});

// Enforce audio formats
const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype;
  const extension = path.extname(file.originalname).toLowerCase();
  
  const allowedMimeTypes = [
    'audio/webm',
    'audio/wav',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/m4a',
    'audio/x-m4a',
    'audio/mp4',
    'video/webm', // Web audio APIs occasionally submit audio in webm video wrappers
  ];

  const allowedExtensions = ['.webm', '.wav', '.mp3', '.ogg', '.m4a', '.mp4'];

  if (allowedMimeTypes.includes(mimeType) || allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new AppError(`Unsupported audio format! Allowed formats: webm, wav, mp3, ogg, m4a. Received MIME: ${mimeType}`, 400), false);
  }
};

// Set size limit to 10MB
const limits = {
  fileSize: 10 * 1024 * 1024,
};

// Create multer middleware instance
const uploadAudio = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = uploadAudio;
