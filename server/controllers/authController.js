const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/customError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Sign JWT token helper function
 * @param {string} id - Database user identifier
 * @returns {string} Encoded token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Helper to structure sanitized user payload responses
 */
const formatUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    targetRole: user.targetRole,
    createdAt: user.createdAt,
  };
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, targetRole } = req.body;

    // Database integrity is handled by Mongoose unique index. Duplicate keys throw 11000, 
    // which our global error handler translates to a user-friendly response.
    const newUser = await User.create({
      name,
      email,
      password,
      targetRole,
    });

    const token = signToken(newUser._id);

    return sendSuccess(res, 201, 'User registered successfully', {
      token,
      user: formatUserResponse(newUser),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login existing user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Fetch user including the hidden password field
    const user = await User.findOne({ email }).select('+password');

    // 2. Validate user presence and password correctness
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3. Generate token
    const token = signToken(user._id);

    return sendSuccess(res, 200, 'Logged in successfully', {
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is guaranteed and pre-fetched by protect middleware
    return sendSuccess(res, 200, 'User profile fetched successfully', {
      user: formatUserResponse(req.user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
