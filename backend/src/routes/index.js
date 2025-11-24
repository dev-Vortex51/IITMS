/**
 * Routes Index
 * Central routing configuration
 */

const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const studentRoutes = require("./studentRoutes");
const facultyRoutes = require("./facultyRoutes");
const departmentRoutes = require("./departmentRoutes");
const placementRoutes = require("./placementRoutes");
const logbookRoutes = require("./logbookRoutes");
const assessmentRoutes = require("./assessmentRoutes");
const supervisorRoutes = require("./supervisorRoutes");
const notificationRoutes = require("./notificationRoutes");
const reportRoutes = require("./reportRoutes");

/**
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

/**
 * API version info
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SIWES Management API",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

/**
 * Mount route modules
 */
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/students", studentRoutes);
router.use("/faculties", facultyRoutes);
router.use("/departments", departmentRoutes);
router.use("/placements", placementRoutes);
router.use("/logbooks", logbookRoutes);
router.use("/assessments", assessmentRoutes);
router.use("/supervisors", supervisorRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reports", reportRoutes);

module.exports = router;
