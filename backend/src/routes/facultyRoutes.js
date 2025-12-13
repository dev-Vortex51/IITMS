/**
 * Faculty Routes
 * Handles faculty management endpoints
 */

const express = require("express");
const router = express.Router();
const { facultyController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const {
  adminOnly,
  adminOrCoordinator,
} = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");
const { validateBody, validateObjectId } = require("../middleware/validation");
const { facultyValidation } = require("../utils/validators");

/**
 * @route   GET /api/v1/faculties
 * @desc    Get all faculties
 * @access  Private (Admin, Coordinator, Academic Supervisor)
 */
router.get(
  "/",
  authenticate,
  (req, res, next) => {
    if (
      [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR].includes(
        req.user.role
      )
    ) {
      next();
    } else {
      res.status(403).json({ success: false, message: "Forbidden" });
    }
  },
  facultyController.getFaculties
);

/**
 * @route   POST /api/v1/faculties
 * @desc    Create a new faculty
 * @access  Private (Admin only)
 */
router.post(
  "/",
  authenticate,
  adminOnly,
  validateBody(facultyValidation.createFaculty),
  facultyController.createFaculty
);

/**
 * @route   GET /api/v1/faculties/:id
 * @desc    Get faculty by ID
 * @access  Private (Admin, Coordinator, Academic Supervisor)
 */
router.get(
  "/:id",
  authenticate,
  (req, res, next) => {
    if (
      [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR].includes(
        req.user.role
      )
    ) {
      next();
    } else {
      res.status(403).json({ success: false, message: "Forbidden" });
    }
  },
  validateObjectId("id"),
  facultyController.getFacultyById
);

/**
 * @route   PUT /api/v1/faculties/:id
 * @desc    Update faculty
 * @access  Private (Admin only)
 */
router.put(
  "/:id",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  validateBody(facultyValidation.updateFaculty),
  facultyController.updateFaculty
);

/**
 * @route   DELETE /api/v1/faculties/:id
 * @desc    Delete (deactivate) faculty
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  facultyController.deleteFaculty
);

/**
 * @route   GET /api/v1/faculties/:id/departments
 * @desc    Get all departments in a faculty
 * @access  Private (Admin, Coordinator)
 */
router.get(
  "/:id/departments",
  authenticate,
  adminOrCoordinator,
  validateObjectId("id"),
  facultyController.getFacultyDepartments
);

module.exports = router;
