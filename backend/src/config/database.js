const mongoose = require("mongoose");
const config = require("./index");
const logger = require("../utils/logger");

const connectDB = async (retries = 5) => {
  try {
    const conn = await mongoose.connect(
      config.database.uri,
      config.database.options,
    );

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected successfully");
    });

    mongoose.connection.on("reconnectFailed", () => {
      logger.error(
        "MongoDB reconnection failed. Please check your database connection.",
      );
    });

    return conn;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);

    if (retries > 0) {
      logger.info(`Retrying connection... (${retries} attempts remaining)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    } else {
      logger.error("Max retries reached. Could not connect to MongoDB.");
      throw error;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  } catch (error) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
    throw error;
  }
};

const dropDB = async () => {
  if (config.env !== "test") {
    throw new Error("Cannot drop database outside of test environment");
  }

  try {
    await mongoose.connection.dropDatabase();
    logger.info("Database dropped successfully");
  } catch (error) {
    logger.error(`Error dropping database: ${error.message}`);
    throw error;
  }
};

const setupGracefulShutdown = () => {
  const shutdown = async (signal) => {
    logger.info(`${signal} received. Closing MongoDB connection...`);
    await disconnectDB();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

module.exports = {
  connectDB,
  disconnectDB,
  dropDB,
  setupGracefulShutdown,
};
