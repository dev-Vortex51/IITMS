/**
 * Student Routes
 * API routes for student management
 */

const express = require("express");
const router = express.Router();
const { studentController } = require("../controllers");
const { authenticate, authorize } = require("../middleware/auth");
const {
  requireRole,
  requireDepartmentAccess,
} = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/students
 * @desc    Create a new student
 * @access  Coordinator, Admin
 */
router.post(
  "/",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  studentController.createStudent
);

/**
 * @route   GET /api/v1/students/all
 * @desc    Get all students (no filters)
 * @access  Admin, Coordinator
 */
router.get(
  "/all",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  studentController.getAllStudents
);

/**
 * @route   GET /api/v1/students
 * @desc    Get all students with filters
 * @access  Admin, Coordinator, Supervisor
 */
router.get(
  "/",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.DEPT_SUPERVISOR),
  studentController.getStudents
);

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get student by ID
 * @access  Student (self), Admin, Coordinator, Supervisor
 */
router.get("/:id", studentController.getStudentById);

/**
 * @route   PUT /api/v1/students/:id
 * @desc    Update student profile
 * @access  Student (self), Admin, Coordinator
 */
router.put(
  "/:id",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  studentController.updateStudent
);

/**
 * @route   GET /api/v1/students/:id/dashboard
 * @desc    Get student dashboard data
 * @access  Student (self), Admin, Coordinator
 */
router.get(
  "/:id/dashboard",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  studentController.getStudentDashboard
);

/**
 * @route   POST /api/v1/students/:id/assign-supervisor
 * @desc    Assign supervisor to student
 * @access  Admin, Coordinator
 */
router.post(
  "/:id/assign-supervisor",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  studentController.assignSupervisor
);

/**
 * @route   GET /api/v1/students/:id/placement
 * @desc    Get student's placement
 * @access  Student (self), Admin, Coordinator
 */
router.get(
  "/:id/placement",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  studentController.getStudentPlacement
);

module.exports = router;
