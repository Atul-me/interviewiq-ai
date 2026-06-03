const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB Database
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    logger.info(`MongoDB connected successfully to cluster: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    // Exit process with failure code
    process.exit(1);
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection runtime error: ${err.message}`);
});

module.exports = connectDB;
