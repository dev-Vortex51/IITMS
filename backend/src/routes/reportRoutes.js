/**
 * Report Routes
 * API routes for reports and analytics
 */

const express = require("express");
const router = express.Router();
const { reportController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/reports/institutional-overview
 * @desc    Get institutional overview and statistics
 * @access  Admin
 */
router.get(
  "/institutional-overview",
  requireRole(ROLES.ADMIN),
  reportController.getInstitutionalOverview
);

/**
 * @route   GET /api/v1/reports/faculties/:facultyId/statistics
 * @desc    Get faculty statistics
 * @access  Admin
 */
router.get(
  "/faculties/:facultyId/statistics",
  requireRole(ROLES.ADMIN),
  reportController.getFacultyStatistics
);

/**
 * @route   GET /api/v1/reports/departments/:departmentId/statistics
 * @desc    Get department statistics
 * @access  Admin, Coordinator
 */
router.get(
  "/departments/:departmentId/statistics",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  reportController.getDepartmentStatistics
);

/**
 * @route   GET /api/v1/reports/students/:studentId/progress
 * @desc    Get student progress report
 * @access  Student (self), Admin, Coordinator, Supervisor
 */
router.get(
  "/students/:studentId/progress",
  reportController.getStudentProgressReport
);

/**
 * @route   GET /api/v1/reports/students/:studentId/export
 * @desc    Export student report (PDF)
 * @access  Student (self), Admin, Coordinator
 */
router.get(
  "/students/:studentId/export",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  reportController.exportStudentReport
);

/**
 * @route   GET /api/v1/reports/supervisors/:supervisorId/performance
 * @desc    Get supervisor performance report
 * @access  Admin, Coordinator
 */
router.get(
  "/supervisors/:supervisorId/performance",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  reportController.getSupervisorPerformanceReport
);

/**
 * @route   GET /api/v1/reports/placements
 * @desc    Get placement report
 * @access  Admin, Coordinator
 */
router.get(
  "/placements",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  reportController.getPlacementReport
);

module.exports = router;
