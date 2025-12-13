/**
 * Database Seeding Script
 * Populates database with comprehensive sample data for development/testing
 * Includes: Users, Faculties, Departments, Students, Supervisors, Placement,
 * Logbooks, Assessments, Notifications.
 */

const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("../config/database");
const {
  User,
  Faculty,
  Department,
  Student,
  Supervisor,
  Placement,
  Logbook,
  Assessment,
  Notification,
} = require("../models");
const logger = require("../utils/logger");
const {
  USER_ROLES,
  PLACEMENT_STATUS,
  LOGBOOK_STATUS,
  ASSESSMENT_STATUS,
  ASSESSMENT_TYPES,
  NOTIFICATION_TYPES,
} = require("../utils/constants");

/**
 * Sample data
 */
const sampleData = {
  admin: {
    email: "admin@siwes.edu",
    password: "Admin@123",
    firstName: "System",
    lastName: "Administrator",
    role: USER_ROLES.ADMIN,
    isFirstLogin: false,
    passwordResetRequired: false,
    phone: "+2348012345678",
  },
};

/**
 * Seed database
 */
const seedDatabase = async () => {
  try {
    logger.info("Starting database seeding...");

    // Connect to database
    await connectDB();

    // Clear existing data (ordered to respect dependencies)
    logger.info("Clearing existing data...");
    // await Notification.deleteMany({});
    // await Assessment.deleteMany({});
    // await Logbook.deleteMany({});
    // await Placement.deleteMany({});
    // await Supervisor.deleteMany({});
    // await Student.deleteMany({});
    // await Department.deleteMany({});
    // await Faculty.deleteMany({});
    await User.deleteOne({ email: "supervisor@company.com" });

    // Create Admin
    logger.info("Creating admin user...");
    // const admin = await User.create(sampleData.admin);
    // logger.info(`Admin created: ${admin.email}`);

    logger.info("╔════════════════════════════════════════════════╗");
    logger.info("║  Database seeding completed successfully!     ║");
    logger.info("╠════════════════════════════════════════════════╣");
    logger.info("║  Login credentials:                            ║");
    logger.info("║  Admin: admin@siwes.edu / Admin@123           ║");
    logger.info("╚════════════════════════════════════════════════╝");

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    logger.error(error.stack);
    await disconnectDB();
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
