/**
 * Department Routes
 * Handles department management endpoints
 */

const express = require("express");
const router = express.Router();
const { departmentController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const {
  adminOnly,
  adminOrCoordinator,
} = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");
const { validateBody, validateObjectId } = require("../middleware/validation");
const { departmentValidation } = require("../utils/validators");

/**
 * @route   GET /api/v1/departments
 * @desc    Get all departments
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
  departmentController.getDepartments
);

/**
 * @route   POST /api/v1/departments
 * @desc    Create a new department
 * @access  Private (Admin only)
 */
router.post(
  "/",
  authenticate,
  adminOnly,
  validateBody(departmentValidation.createDepartment),
  departmentController.createDepartment
);

/**
 * @route   GET /api/v1/departments/:id
 * @desc    Get department by ID
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
  departmentController.getDepartmentById
);

/**
 * @route   PUT /api/v1/departments/:id
 * @desc    Update department
 * @access  Private (Admin only)
 */
router.put(
  "/:id",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  validateBody(departmentValidation.updateDepartment),
  departmentController.updateDepartment
);

/**
 * @route   DELETE /api/v1/departments/:id
 * @desc    Delete (deactivate) department
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  departmentController.deleteDepartment
);

/**
 * @route   GET /api/v1/departments/:id/students
 * @desc    Get all students in a department
 * @access  Private (Admin, Coordinator)
 */
router.get(
  "/:id/students",
  authenticate,
  adminOrCoordinator,
  validateObjectId("id"),
  departmentController.getDepartmentStudents
);

/**
 * @route   PATCH /api/v1/departments/:id/coordinator
 * @desc    Assign coordinator to department
 * @access  Private (Admin only)
 */
router.patch(
  "/:id/coordinator",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  departmentController.assignCoordinator
);

/**
 * @route   GET /api/v1/departments/:id/available-coordinators
 * @desc    Get coordinators available for assignment to this department
 * @access  Private (Admin only)
 */
router.get(
  "/:id/available-coordinators",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  departmentController.getAvailableCoordinators
);

module.exports = router;
