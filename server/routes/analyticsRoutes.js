const express = require('express');
const { getUserDashboardStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { cacheResponse } = require('../middleware/cacheMiddleware');

const router = express.Router();

// Require protection (JWT validation) for all analytics routes
router.use(protect);

// Retrieve aggregated stats for dashboard components (cached for 5 minutes)
router.get('/dashboard', cacheResponse('dashboard', 300), getUserDashboardStats);

module.exports = router;
