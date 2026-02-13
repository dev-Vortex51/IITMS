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
  facultyController.getFaculties,
);

router.post(
  "/",
  authenticate,
  adminOnly,
  validateBody(facultyValidation.createFaculty),
  facultyController.createFaculty,
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
  facultyController.getFacultyById,
);

router.put(
  "/:id",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  validateBody(facultyValidation.updateFaculty),
  facultyController.updateFaculty,
);

router.delete(
  "/:id",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  facultyController.deleteFaculty,
);

router.get(
  "/:id/departments",
  authenticate,
  adminOrCoordinator,
  validateObjectId("id"),
  facultyController.getFacultyDepartments,
);

module.exports = router;
