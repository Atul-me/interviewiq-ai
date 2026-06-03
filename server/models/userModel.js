const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Prevents password from leaking in standard queries
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    targetRole: {
      type: String,
      trim: true,
      default: '',
    },
    passwordChangedAt: Date,
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeText: {
      type: String,
      default: '',
    },
    resumeParsedAt: Date,
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

/**
 * Mongoose Pre-Save Middleware
 * Encrypt password using bcrypt before saving to the database.
 */
userSchema.pre('save', async function () {
  // Only hash password if it was modified (or is new)
  if (!this.isModified('password')) return;

  // Hash password with cost factor of 12
  this.password = await bcrypt.hash(this.password, 12);
  
  // Set passwordChangedAt if password was changed (exclude on first creation)
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1s to ensure token generation time is after passwordChangedAt
  }
});

/**
 * Instance Method: Compare candidate password with stored hashed password
 * @param {string} candidatePassword - Password input from request
 * @param {string} userPassword - Hashed password from database
 * @returns {Promise<boolean>} Match comparison result
 */
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Instance Method: Check if password was changed after JWT was issued
 * @param {number} JWTTimestamp - Token issuance timestamp (in seconds)
 * @returns {boolean} True if password was modified after token creation, false otherwise
 */
userSchema.methods.passwordChangedAfterToken = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  
  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
