const express = require("express");
const router = express.Router();
const { reportController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");

// All routes require authentication
router.use(authenticate);

router.get(
  "/institutional-overview",
  requireRole(ROLES.ADMIN),
  reportController.getInstitutionalOverview,
);

router.get(
  "/faculties/:facultyId/statistics",
  requireRole(ROLES.ADMIN),
  reportController.getFacultyStatistics,
);

router.get(
  "/departments/:departmentId/statistics",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  reportController.getDepartmentStatistics,
);

router.get(
  "/students/:studentId/progress",
  reportController.getStudentProgressReport,
);

router.get(
  "/students/:studentId/export",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  reportController.exportStudentReport,
);

router.get(
  "/supervisors/:supervisorId/performance",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  reportController.getSupervisorPerformanceReport,
);

router.get(
  "/placements",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  reportController.getPlacementReport,
);

module.exports = router;
