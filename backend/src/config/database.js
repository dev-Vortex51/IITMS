const {
  connectPrisma,
  disconnectPrisma,
  setupGracefulShutdown: setupPrismaShutdown,
} = require("./prisma");
const config = require("./index");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable not set");
    }

    logger.info("Connecting to PostgreSQL via Prisma...");
    await connectPrisma();

    return;
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    logger.info("Disconnecting from database...");
    await disconnectPrisma();
    logger.info("✓ Database disconnected");
  } catch (error) {
    logger.error(`Error disconnecting from database: ${error.message}`);
    throw error;
  }
};

const dropDB = async () => {
  if (config.env !== "test") {
    throw new Error("Cannot drop database outside of test environment");
  }

  try {
    const { getPrismaClient } = require("./prisma");
    const prisma = getPrismaClient();

    // Delete all data in reverse order of foreign keys
    const tables = [
      "supervisor_assignments",
      "assessments",
      "attendances",
      "logbook_reviews",
      "logbook_evidence",
      "logbooks",
      "placements",
      "notification_preferences",
      "notifications",
      "invitations",
      "students",
      "supervisors",
      "industry_partners",
      "_CoordinatorDepartments",
      "departments",
      "faculties",
      "users",
      "system_settings",
    ];

    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
      } catch (err) {
        logger.warn(`Could not truncate table ${table}: ${err.message}`);
      }
    }

    logger.info("✓ Test database cleared");
  } catch (error) {
    logger.error(`Error dropping database: ${error.message}`);
    throw error;
  }
};

const setupGracefulShutdown = () => {
  setupPrismaShutdown();
};

module.exports = {
  connectDB,
  disconnectDB,
  dropDB,
  setupGracefulShutdown,
};
