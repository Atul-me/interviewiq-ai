const path = require('path');
// Load environment variables from workspace root
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('./middleware/sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/customError');
const { sendSuccess } = require('./utils/apiResponse');
const authRouter = require('./routes/authRoutes');
const resumeRouter = require('./routes/resumeRoutes');
const aiRouter = require('./routes/aiRoutes');
const interviewRouter = require('./routes/interviewRoutes');
const analyticsRouter = require('./routes/analyticsRoutes');

// Initialize Express app
const app = express();

// 1. Establish Database Connection
connectDB();

// 2. Global Middlewares

// Security Headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Morgan Logger for HTTP requests (piped to Winston)
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.http(message.trim()) },
  })
);

// Body Parsers
app.use(express.json({ limit: '10kb' })); // limit body size to prevent DOS attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// NoSQL Query Injection Prevention
app.use(mongoSanitize);

// Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter);

// 3. Routes

// Health Check Route
app.get('/api/v1/health', (req, res) => {
  return sendSuccess(res, 200, 'Server is healthy and running', {
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// Authentication Routes
app.use('/api/v1/auth', authRouter);

// Resume Routes
app.use('/api/v1/resumes', resumeRouter);

// AI Routes
app.use('/api/v1/ai', aiRouter);

// Interview Routes
app.use('/api/v1/interviews', interviewRouter);

// Analytics Routes
app.use('/api/v1/analytics', analyticsRouter);

// Static File Serving for Uploaded Assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve compiled static client assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Forward all non-API paths to compiled React template
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Fallback Route for Undefined API Paths
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4. Global Error Handling Middleware
app.use(errorHandler);

// 5. Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle termination signals for graceful shutdowns
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('Database connection closed.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database connection close:', err.message);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
