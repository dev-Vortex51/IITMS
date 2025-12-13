/**
 * Supervisor Routes
 * API routes for supervisor management
 */

const express = require("express");
const router = express.Router();
const { supervisorController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/supervisors
 * @desc    Get all supervisors
 * @access  Admin, Coordinator, Academic Supervisor, Industrial Supervisor
 */
router.get(
  "/",
  requireRole(
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.ACADEMIC_SUPERVISOR,
    ROLES.INDUSTRIAL_SUPERVISOR
  ),
  supervisorController.getSupervisors
);

/**
 * @route   GET /api/v1/supervisors/available
 * @desc    Get available supervisors for assignment
 * @access  Admin, Coordinator
 */
router.get(
  "/available",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  supervisorController.getAvailableSupervisors
);

/**
 * @route   GET /api/v1/supervisors/suggestions
 * @desc    Get supervisor suggestions for a student
 * @access  Admin, Coordinator
 */
router.get(
  "/suggestions",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  supervisorController.getSupervisorSuggestions
);

/**
 * @route   GET /api/v1/supervisors/:id
 * @desc    Get supervisor by ID
 * @access  Authenticated users
 */
router.get("/:id", supervisorController.getSupervisorById);

/**
 * @route   PUT /api/v1/supervisors/:id
 * @desc    Update supervisor profile
 * @access  Supervisor (self), Admin, Coordinator
 */
router.put(
  "/:id",
  requireRole(
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.ACADEMIC_SUPERVISOR,
    ROLES.INDUSTRIAL_SUPERVISOR
  ),
  supervisorController.updateSupervisor
);

/**
 * @route   GET /api/v1/supervisors/:id/dashboard
 * @desc    Get supervisor dashboard
 * @access  Supervisor (self), Admin, Coordinator
 */
router.get(
  "/:id/dashboard",
  requireRole(
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.ACADEMIC_SUPERVISOR,
    ROLES.INDUSTRIAL_SUPERVISOR
  ),
  supervisorController.getSupervisorDashboard
);

/**
 * @route   POST /api/v1/supervisors/:id/assign-student
 * @desc    Assign student to supervisor
 * @access  Admin, Coordinator
 */
router.post(
  "/:id/assign-student",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  supervisorController.assignStudent
);

/**
 * @route   POST /api/v1/supervisors/:id/unassign-student
 * @desc    Unassign student from supervisor
 * @access  Admin, Coordinator
 */
router.post(
  "/:id/unassign-student",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  supervisorController.unassignStudent
);

module.exports = router;
