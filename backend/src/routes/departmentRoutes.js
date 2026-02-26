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

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    if (
      [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR].includes(
        req.user.role,
      )
    ) {
      next();
    } else {
      res.status(403).json({ success: false, message: "Forbidden" });
    }
  },
  departmentController.getDepartments,
);

router.post(
  "/",
  authenticate,
  adminOnly,
  validateBody(departmentValidation.createDepartment),
  departmentController.createDepartment,
);

router.get(
  "/:id",
  authenticate,
  (req, res, next) => {
    if (
      [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR].includes(
        req.user.role,
      )
    ) {
      next();
    } else {
      res.status(403).json({ success: false, message: "Forbidden" });
    }
  },
  validateObjectId("id"),
  departmentController.getDepartmentById,
);

router.put(
  "/:id",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  validateBody(departmentValidation.updateDepartment),
  departmentController.updateDepartment,
);

router.delete(
  "/:id",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  departmentController.deleteDepartment,
);

router.patch(
  "/:id/toggle-status",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  departmentController.toggleDepartmentStatus,
);

router.delete(
  "/:id/hard-delete",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  departmentController.hardDeleteDepartment,
);

router.get(
  "/:id/students",
  authenticate,
  adminOrCoordinator,
  validateObjectId("id"),
  departmentController.getDepartmentStudents,
);

router.patch(
  "/:id/coordinator",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  departmentController.assignCoordinator,
);

router.get(
  "/:id/available-coordinators",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  departmentController.getAvailableCoordinators,
);

module.exports = router;
