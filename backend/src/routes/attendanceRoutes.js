/**
 * Attendance Routes
 * API endpoints for attendance tracking
 */

const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorization");
const { USER_ROLES } = require("../utils/constants");

// Student routes
router.post(
  "/check-in",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  attendanceController.checkIn
);

router.put(
  "/check-out",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  attendanceController.checkOut
);

router.get(
  "/today",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  attendanceController.getTodayCheckIn
);

router.get(
  "/my-attendance",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  attendanceController.getMyAttendance
);

router.get(
  "/my-stats",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  attendanceController.getMyStats
);

router.post(
  "/absence-request",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  attendanceController.submitAbsenceRequest
);

// Supervisor/Coordinator/Admin routes
router.get(
  "/student/:studentId",
  authenticate,
  authorize(
    USER_ROLES.ADMIN,
    USER_ROLES.COORDINATOR,
    USER_ROLES.ACADEMIC_SUPERVISOR,
    USER_ROLES.INDUSTRIAL_SUPERVISOR,
    USER_ROLES.DEPT_SUPERVISOR
  ),
  attendanceController.getStudentAttendance
);

router.get(
  "/student/:studentId/stats",
  authenticate,
  authorize(
    USER_ROLES.ADMIN,
    USER_ROLES.COORDINATOR,
    USER_ROLES.ACADEMIC_SUPERVISOR,
    USER_ROLES.INDUSTRIAL_SUPERVISOR,
    USER_ROLES.DEPT_SUPERVISOR
  ),
  attendanceController.getStudentStats
);

router.get(
  "/placement/:placementId",
  authenticate,
  authorize(
    USER_ROLES.ADMIN,
    USER_ROLES.COORDINATOR,
    USER_ROLES.ACADEMIC_SUPERVISOR,
    USER_ROLES.INDUSTRIAL_SUPERVISOR,
    USER_ROLES.DEPT_SUPERVISOR
  ),
  attendanceController.getPlacementAttendance
);

router.post(
  "/:attendanceId/acknowledge",
  authenticate,
  authorize(
    USER_ROLES.ACADEMIC_SUPERVISOR,
    USER_ROLES.INDUSTRIAL_SUPERVISOR,
    USER_ROLES.DEPT_SUPERVISOR
  ),
  attendanceController.acknowledgeAttendance
);

// Supervisor approval routes
router.post(
  "/:attendanceId/approve",
  authenticate,
  authorize(
    USER_ROLES.ACADEMIC_SUPERVISOR,
    USER_ROLES.INDUSTRIAL_SUPERVISOR,
    USER_ROLES.DEPT_SUPERVISOR
  ),
  attendanceController.approveAttendance
);

router.post(
  "/:attendanceId/reject",
  authenticate,
  authorize(
    USER_ROLES.ACADEMIC_SUPERVISOR,
    USER_ROLES.INDUSTRIAL_SUPERVISOR,
    USER_ROLES.DEPT_SUPERVISOR
  ),
  attendanceController.rejectAttendance
);

router.patch(
  "/:attendanceId/reclassify",
  authenticate,
  authorize(
    USER_ROLES.ACADEMIC_SUPERVISOR,
    USER_ROLES.INDUSTRIAL_SUPERVISOR,
    USER_ROLES.DEPT_SUPERVISOR
  ),
  attendanceController.reclassifyAttendance
);

// Attendance summary route
router.get(
  "/summary/:studentId",
  authenticate,
  authorize(
    USER_ROLES.ADMIN,
    USER_ROLES.COORDINATOR,
    USER_ROLES.ACADEMIC_SUPERVISOR,
    USER_ROLES.INDUSTRIAL_SUPERVISOR,
    USER_ROLES.DEPT_SUPERVISOR,
    USER_ROLES.STUDENT
  ),
  attendanceController.getAttendanceSummary
);

// Mark absent route - for manual marking or scheduled jobs
router.post(
  "/mark-absent",
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.COORDINATOR),
  attendanceController.markAbsentForDate
);

module.exports = router;
