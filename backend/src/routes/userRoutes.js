/**
 * User Routes
 * Handles user management endpoints
 */

const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const {
  adminOrCoordinator,
  adminOnly,
  ownerOrAdmin,
} = require("../middleware/authorization");
const { validateBody, validateObjectId } = require("../middleware/validation");
const { userValidation } = require("../utils/validators");

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Private (Admin, Coordinator)
 */
router.post(
  "/",
  authenticate,
  adminOrCoordinator,
  validateBody(userValidation.createUser),
  userController.createUser
);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private (Admin, Coordinator)
 */
router.get("/", authenticate, adminOrCoordinator, userController.getUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin, Coordinator, Self)
 */
router.get(
  "/:id",
  authenticate,
  validateObjectId("id"),
  userController.getUserById
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Admin, Coordinator)
 */
router.put(
  "/:id",
  authenticate,
  adminOrCoordinator,
  validateObjectId("id"),
  validateBody(userValidation.updateUser),
  userController.updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete (deactivate) user
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  userController.deleteUser
);

/**
 * @route   POST /api/v1/users/industrial-supervisor
 * @desc    Create industrial supervisor
 * @access  Private (Coordinator)
 */
router.post(
  "/industrial-supervisor",
  authenticate,
  adminOrCoordinator,
  userController.createIndustrialSupervisor
);

module.exports = router;
