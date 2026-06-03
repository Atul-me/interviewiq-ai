const resumeService = require('../services/resumeService');
const AppError = require('../utils/customError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * @desc    Upload and parse PDF Resume
 * @route   POST /api/v1/resumes/upload
 * @access  Private
 */
const uploadResume = async (req, res, next) => {
  try {
    // 1. Verify file exists on request (attached by Multer)
    if (!req.file) {
      return next(new AppError('Please upload a PDF file under the key "resume"', 400));
    }

    const filePath = req.file.path;
    
    // 2. Call PDF parsing service to extract text
    const extractedText = await resumeService.parsePDF(filePath);

    // 3. Save resume info on current user model
    // Store relative serving path for download access
    req.user.resumeUrl = `/uploads/resumes/${req.file.filename}`;
    req.user.resumeText = extractedText;
    req.user.resumeParsedAt = Date.now();
    
    await req.user.save();

    // 4. Send success response back to the client
    return sendSuccess(res, 200, 'Resume uploaded and parsed successfully', {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        targetRole: req.user.targetRole,
        resumeUrl: req.user.resumeUrl,
        resumeParsedAt: req.user.resumeParsedAt,
        // Don't return the entire raw parsed text in standard API responses to optimize payload size,
        // but verify it exists by sending its character length
        resumeTextLength: extractedText.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
};
