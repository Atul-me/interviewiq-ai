const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/customError');

// Define directory pathway for storing resumes
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');

// Dynamically generate directory structure on bootstrap if absent
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage strategy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name format: user_id-timestamp.pdf
    const userId = req.user ? req.user._id : 'anonymous';
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${userId}-${Date.now()}${extension}`);
  },
});

// Define filter to enforce PDF formats
const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype;
  const extension = path.extname(file.originalname).toLowerCase();
  
  if (mimeType === 'application/pdf' && extension === '.pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF files are allowed!', 400), false);
  }
};

// Calculate size limits dynamically from env variables
const maxFileSizeMb = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10);
const limits = {
  fileSize: maxFileSizeMb * 1024 * 1024, // conversion to bytes
};

// Create multer middleware instance
const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;
