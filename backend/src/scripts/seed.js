const { getPrismaClient } = require("../config/prisma");
const logger = require("../utils/logger");
const bcrypt = require("bcryptjs");
const { USER_ROLES } = require("../utils/constants");

const prisma = getPrismaClient();

/**
 * Sample data
 */
const sampleData = {
  admin: {
    email: "admin@siwes.edu",
    password: "Admin@123",
    firstName: "Malick",
    lastName: "Diof",
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

    // Check current data
    const userCount = await prisma.user.count();
    const facultyCount = await prisma.faculty.count();

    if (userCount > 0 || facultyCount > 0) {
      logger.info("Database already seeded. Skipping...");
      await prisma.$disconnect();
      process.exit(0);
    }

    // Create Admin
    logger.info("Creating admin user...");
    const hashedPassword = await bcrypt.hash(sampleData.admin.password, 12);

    const admin = await prisma.user.create({
      data: {
        email: sampleData.admin.email,
        password: hashedPassword,
        firstName: sampleData.admin.firstName,
        lastName: sampleData.admin.lastName,
        role: sampleData.admin.role,
        isFirstLogin: sampleData.admin.isFirstLogin,
        passwordResetRequired: sampleData.admin.passwordResetRequired,
        phone: sampleData.admin.phone,
        isActive: true,
      },
    });
    logger.info(`Admin created: ${admin.email}`);

    logger.info("╔════════════════════════════════════════════════╗");
    logger.info("║  Database seeding completed successfully!     ║");
    logger.info("╠════════════════════════════════════════════════╣");
    logger.info("║  Login credentials:                            ║");
    logger.info("║  Admin: admin@siwes.edu / Admin@123           ║");
    logger.info("╚════════════════════════════════════════════════╝");

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    logger.error(error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
