const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    logger.error("MONGO_URI not found in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.debug("MongoDB connection established successfully");
  } catch (error) {
    console.log(error);
    logger.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
