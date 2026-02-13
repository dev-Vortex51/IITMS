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

router.post(
  "/",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  studentController.createStudent,
);

router.get(
  "/all",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  studentController.getAllStudents,
);

router.get(
  "/",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR),
  studentController.getStudents,
);

router.get("/:id", studentController.getStudentById);

router.put(
  "/:id",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  studentController.updateStudent,
);

router.get(
  "/:id/dashboard",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  studentController.getStudentDashboard,
);

router.post(
  "/:id/assign-supervisor",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  studentController.assignSupervisor,
);

router.get(
  "/:id/placement",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  studentController.getStudentPlacement,
);

module.exports = router;
