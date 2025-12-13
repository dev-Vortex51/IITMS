/**
 * Assessment Routes
 * API routes for assessment management
 */

const express = require("express");
const router = express.Router();
const { assessmentController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/assessments
 * @desc    Create assessment
 * @access  Supervisor
 */
router.post(
  "/",
  requireRole(ROLES.ACADEMIC_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR),
  assessmentController.createAssessment
);

/**
 * @route   GET /api/v1/assessments
 * @desc    Get all assessments
 * @access  Authenticated users
 */
router.get("/", assessmentController.getAssessments);

/**
 * @route   GET /api/v1/assessments/pending
 * @desc    Get pending assessments for supervisor
 * @access  Supervisor
 */
router.get(
  "/pending",
  requireRole(ROLES.ACADEMIC_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR),
  assessmentController.getSupervisorPendingAssessments
);

/**
 * @route   GET /api/v1/assessments/:id
 * @desc    Get assessment by ID
 * @access  Authenticated users
 */
router.get("/:id", assessmentController.getAssessmentById);

/**
 * @route   PUT /api/v1/assessments/:id
 * @desc    Update assessment
 * @access  Supervisor (owner)
 */
router.put(
  "/:id",
  requireRole(ROLES.ACADEMIC_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR),
  assessmentController.updateAssessment
);

/**
 * @route   POST /api/v1/assessments/:id/submit
 * @desc    Submit assessment
 * @access  Supervisor (owner)
 */
router.post(
  "/:id/submit",
  requireRole(ROLES.ACADEMIC_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR),
  assessmentController.submitAssessment
);

/**
 * @route   POST /api/v1/assessments/:id/verify
 * @desc    Verify assessment
 * @access  Admin, Coordinator
 */
router.post(
  "/:id/verify",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  assessmentController.verifyAssessment
);

module.exports = router;
