const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validations/authValidation');

const router = express.Router();

// Public routes with validation middleware
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes (requires Bearer JWT validation)
router.get('/me', protect, getMe);

module.exports = router;
