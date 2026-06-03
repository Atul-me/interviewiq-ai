const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const AppError = require('../utils/customError');

/**
 * Authentication Middleware: Verify JWT and attach user profile to request.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from Authorization header (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to gain access.', 401)
      );
    }

    // 2. Validate token (signature and expiration)
    // promisify converts jwt.verify callback pattern to async/await
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. Verify user still exists in database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token no longer exists.',
          401
        )
      );
    }

    // 4. Verify user has not changed password after token issue timestamp
    if (currentUser.passwordChangedAfterToken(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    // Grant access: attach user model to request context
    req.user = currentUser;
    next();
  } catch (error) {
    // Forward JWT errors to global exception interceptor
    next(error);
  }
};

/**
 * Authorization Middleware: Limit endpoint access to specific roles.
 * @param {...string} roles - Permitted user roles (e.g. 'admin', 'user')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is guaranteed by 'protect' middleware
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
