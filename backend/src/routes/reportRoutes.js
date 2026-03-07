const express = require("express");
const router = express.Router();
const { reportController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { cacheResponse } = require("../middleware/cache");
const config = require("../config");
const { ROLES } = require("../utils/constants");

// All routes require authentication
router.use(authenticate);

router.get(
  "/institutional-overview",
  requireRole(ROLES.ADMIN),
  cacheResponse(config.cache.reportsTtl),
  reportController.getInstitutionalOverview,
);

router.get(
  "/faculties/:facultyId/statistics",
  requireRole(ROLES.ADMIN),
  cacheResponse(config.cache.reportsTtl),
  reportController.getFacultyStatistics,
);

router.get(
  "/departments/:departmentId/statistics",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  cacheResponse(config.cache.reportsTtl),
  reportController.getDepartmentStatistics,
);

router.get(
  "/students/:studentId/progress",
  cacheResponse(config.cache.reportsTtl),
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
  cacheResponse(config.cache.reportsTtl),
  reportController.getSupervisorPerformanceReport,
);

router.get(
  "/placements",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  cacheResponse(config.cache.reportsTtl),
  reportController.getPlacementReport,
);

module.exports = router;
