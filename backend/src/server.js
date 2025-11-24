/**
 * Server Entry Point
 * Starts the Express server and establishes database connection
 */

const app = require("./app");
const config = require("./config");
const { connectDB, setupGracefulShutdown } = require("./config/database");
const logger = require("./utils/logger");

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    logger.info("Connecting to MongoDB...");
    await connectDB();

    // Start Express server
    const server = app.listen(config.port, () => {
      logger.info(`
╔════════════════════════════════════════════════════════════╗
║  SIWES Management System API Server                       ║
╠════════════════════════════════════════════════════════════╣
║  Environment: ${config.env.padEnd(42)}║
║  Port:        ${String(config.port).padEnd(42)}║
║  API Version: ${config.apiVersion.padEnd(42)}║
║  URL:         http://localhost:${config.port}/api/${config.apiVersion.padEnd(
        19
      )}║
╚════════════════════════════════════════════════════════════╝
      `);
      logger.info("Server is ready to accept connections");
    });

    // Setup graceful shutdown
    setupGracefulShutdown();

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`Port ${config.port} is already in use`);
      } else {
        logger.error(`Server error: ${error.message}`);
      }
      process.exit(1);
    });

    // Handle uncaught errors
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at:", promise, "reason:", reason);
      if (config.isProduction) {
        server.close(() => {
          process.exit(1);
        });
      }
    });

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
