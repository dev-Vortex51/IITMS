/**
 * Logbook Routes
 * API routes for logbook management
 */

const express = require("express");
const router = express.Router();
const { logbookController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/logbooks
 * @desc    Create logbook entry
 * @access  Student
 */
router.post(
  "/",
  requireRole([ROLES.STUDENT]),
  logbookController.createLogbookEntry
);

/**
 * @route   GET /api/v1/logbooks
 * @desc    Get all logbooks
 * @access  Authenticated users
 */
router.get("/", logbookController.getLogbooks);

/**
 * @route   GET /api/v1/logbooks/pending-review
 * @desc    Get pending logbooks for supervisor
 * @access  Supervisor
 */
router.get(
  "/pending-review",
  requireRole([ROLES.DEPARTMENTAL_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR]),
  logbookController.getLogbooksPendingReview
);

/**
 * @route   GET /api/v1/logbooks/:id
 * @desc    Get logbook by ID
 * @access  Authenticated users
 */
router.get("/:id", logbookController.getLogbookById);

/**
 * @route   PUT /api/v1/logbooks/:id
 * @desc    Update logbook entry
 * @access  Student (owner)
 */
router.put(
  "/:id",
  requireRole([ROLES.STUDENT]),
  logbookController.updateLogbookEntry
);

/**
 * @route   POST /api/v1/logbooks/:id/submit
 * @desc    Submit logbook entry
 * @access  Student (owner)
 */
router.post(
  "/:id/submit",
  requireRole([ROLES.STUDENT]),
  logbookController.submitLogbookEntry
);

/**
 * @route   POST /api/v1/logbooks/:id/review
 * @desc    Review logbook
 * @access  Supervisor
 */
router.post(
  "/:id/review",
  requireRole([ROLES.DEPARTMENTAL_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR]),
  logbookController.reviewLogbook
);

module.exports = router;
