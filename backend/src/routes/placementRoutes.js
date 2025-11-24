/**
 * Placement Routes
 * API routes for placement management
 */

const express = require("express");
const router = express.Router();
const { placementController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/placements
 * @desc    Create placement application
 * @access  Student
 */
router.post(
  "/",
  requireRole(ROLES.STUDENT),
  placementController.createPlacement
);

/**
 * @route   GET /api/v1/placements
 * @desc    Get all placements
 * @access  Admin, Coordinator
 */
router.get(
  "/",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  placementController.getPlacements
);

/**
 * @route   GET /api/v1/placements/:id
 * @desc    Get placement by ID
 * @access  Authenticated users
 */
router.get("/:id", placementController.getPlacementById);

/**
 * @route   PUT /api/v1/placements/:id
 * @desc    Update placement
 * @access  Student (owner)
 */
router.put(
  "/:id",
  requireRole(ROLES.STUDENT),
  placementController.updatePlacement
);

/**
 * @route   POST /api/v1/placements/:id/review
 * @desc    Review placement (approve/reject)
 * @access  Admin, Coordinator
 */
router.post(
  "/:id/review",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  placementController.reviewPlacement
);

/**
 * @route   POST /api/v1/placements/:id/assign-supervisor
 * @desc    Assign industrial supervisor to placement
 * @access  Admin, Coordinator
 */
router.post(
  "/:id/assign-supervisor",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  placementController.assignIndustrialSupervisor
);

/**
 * @route   DELETE /api/v1/placements/:id
 * @desc    Delete/withdraw placement
 * @access  Student (owner)
 */
router.delete(
  "/:id",
  requireRole(ROLES.STUDENT),
  placementController.deletePlacement
);

module.exports = router;
