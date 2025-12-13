/**
 * Attendance Controller
 * Handles HTTP requests for attendance tracking
 */

const attendanceService = require("../services/attendanceService");
const { asyncHandler } = require("../middleware/errorHandler");
const { formatResponse } = require("../utils/helpers");

/**
 * Student checks in for the day
 * POST /api/v1/attendance/check-in
 * @access Student only
 */
const checkIn = asyncHandler(async (req, res) => {
  const studentId = req.user.studentProfile?._id || req.body.studentId;

  if (!studentId) {
    return res
      .status(400)
      .json(formatResponse(false, "Student profile not found", null));
  }

  const attendance = await attendanceService.checkIn(studentId, req.body);

  res.status(201).json(
    formatResponse(true, "Check-in successful", attendance, {
      status: attendance.status,
      checkInTime: attendance.checkInTime,
    })
  );
});

/**
 * Get today's check-in status
 * GET /api/v1/attendance/today
 * @access Student only
 */
const getTodayCheckIn = asyncHandler(async (req, res) => {
  const studentId = req.user.studentProfile?._id;

  if (!studentId) {
    return res
      .status(400)
      .json(formatResponse(false, "Student profile not found", null));
  }

  const attendance = await attendanceService.getTodayCheckIn(studentId);

  res.json(
    formatResponse(
      true,
      attendance ? "Check-in record found" : "Not checked in today",
      attendance
    )
  );
});

/**
 * Get attendance history for authenticated student
 * GET /api/v1/attendance/my-attendance
 * @access Student only
 */
const getMyAttendance = asyncHandler(async (req, res) => {
  const studentId = req.user.studentProfile?._id;

  if (!studentId) {
    return res
      .status(400)
      .json(formatResponse(false, "Student profile not found", null));
  }

  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    status: req.query.status,
  };

  const attendance = await attendanceService.getAttendanceHistory(
    studentId,
    filters,
    req.user
  );

  res.json(
    formatResponse(
      true,
      "Attendance history retrieved successfully",
      attendance,
      { count: attendance.length }
    )
  );
});

/**
 * Get attendance statistics for authenticated student
 * GET /api/v1/attendance/my-stats
 * @access Student only
 */
const getMyStats = asyncHandler(async (req, res) => {
  const studentId = req.user.studentProfile?._id;

  if (!studentId) {
    return res
      .status(400)
      .json(formatResponse(false, "Student profile not found", null));
  }

  const stats = await attendanceService.getAttendanceStats(studentId, req.user);

  res.json(
    formatResponse(true, "Attendance statistics retrieved successfully", stats)
  );
});

/**
 * Get attendance history for a specific student
 * GET /api/v1/attendance/student/:studentId
 * @access Coordinator, Supervisor, Admin
 */
const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    status: req.query.status,
  };

  const attendance = await attendanceService.getAttendanceHistory(
    studentId,
    filters,
    req.user
  );

  res.json(
    formatResponse(
      true,
      "Student attendance retrieved successfully",
      attendance,
      { count: attendance.length }
    )
  );
});

/**
 * Get attendance statistics for a specific student
 * GET /api/v1/attendance/student/:studentId/stats
 * @access Coordinator, Supervisor, Admin
 */
const getStudentStats = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const stats = await attendanceService.getAttendanceStats(studentId, req.user);

  res.json(
    formatResponse(
      true,
      "Student attendance statistics retrieved successfully",
      stats
    )
  );
});

/**
 * Get attendance records for a placement
 * GET /api/v1/attendance/placement/:placementId
 * @access Supervisor, Coordinator, Admin
 */
const getPlacementAttendance = asyncHandler(async (req, res) => {
  const { placementId } = req.params;

  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    status: req.query.status,
  };

  const attendance = await attendanceService.getPlacementAttendance(
    placementId,
    filters,
    req.user
  );

  res.json(
    formatResponse(
      true,
      "Placement attendance retrieved successfully",
      attendance,
      { count: attendance.length }
    )
  );
});

/**
 * Supervisor acknowledges student attendance
 * POST /api/v1/attendance/:attendanceId/acknowledge
 * @access Supervisor only
 */
const acknowledgeAttendance = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;
  const supervisorId = req.user.supervisorProfile?._id;

  if (!supervisorId) {
    return res
      .status(400)
      .json(formatResponse(false, "Supervisor profile not found", null));
  }

  const attendance = await attendanceService.acknowledgeAttendance(
    attendanceId,
    supervisorId
  );

  res.json(
    formatResponse(true, "Attendance acknowledged successfully", attendance)
  );
});

/**
 * Student checks out for the day
 * PUT /api/v1/attendance/check-out
 * @access Student only
 */
const checkOut = asyncHandler(async (req, res) => {
  const studentId = req.user.studentProfile?._id;

  if (!studentId) {
    return res
      .status(400)
      .json(formatResponse(false, "Student profile not found", null));
  }

  const attendance = await attendanceService.checkOut(studentId, req.body);

  res.json(
    formatResponse(true, "Check-out successful", attendance, {
      checkOutTime: attendance.checkOutTime,
      hoursWorked: attendance.hoursWorked,
      dayStatus: attendance.dayStatus,
    })
  );
});

/**
 * Submit absence request
 * POST /api/v1/attendance/absence-request
 * @access Student only
 */
const submitAbsenceRequest = asyncHandler(async (req, res) => {
  const studentId = req.user.studentProfile?._id;

  if (!studentId) {
    return res
      .status(400)
      .json(formatResponse(false, "Student profile not found", null));
  }

  const { date, reason } = req.body;

  if (!date || !reason) {
    return res
      .status(400)
      .json(formatResponse(false, "Date and reason are required", null));
  }

  const attendance = await attendanceService.submitAbsenceRequest(
    studentId,
    date,
    reason
  );

  res
    .status(201)
    .json(
      formatResponse(true, "Absence request submitted successfully", attendance)
    );
});

/**
 * Approve attendance/absence
 * POST /api/v1/attendance/:attendanceId/approve
 * @access Supervisor only
 */
const approveAttendance = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;
  const supervisorId = req.user.supervisorProfile?._id;

  if (!supervisorId) {
    return res
      .status(400)
      .json(formatResponse(false, "Supervisor profile not found", null));
  }

  const { comment } = req.body;

  const attendance = await attendanceService.approveAttendance(
    attendanceId,
    supervisorId,
    comment
  );

  res.json(
    formatResponse(true, "Attendance approved successfully", attendance)
  );
});

/**
 * Reject attendance/absence
 * POST /api/v1/attendance/:attendanceId/reject
 * @access Supervisor only
 */
const rejectAttendance = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;
  const supervisorId = req.user.supervisorProfile?._id;

  if (!supervisorId) {
    return res
      .status(400)
      .json(formatResponse(false, "Supervisor profile not found", null));
  }

  const { comment } = req.body;

  if (!comment) {
    return res
      .status(400)
      .json(formatResponse(false, "Rejection reason is required", null));
  }

  const attendance = await attendanceService.rejectAttendance(
    attendanceId,
    supervisorId,
    comment
  );

  res.json(
    formatResponse(true, "Attendance rejected successfully", attendance)
  );
});

/**
 * Reclassify attendance day status
 * PATCH /api/v1/attendance/:attendanceId/reclassify
 * @access Supervisor only
 */
const reclassifyAttendance = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;
  const supervisorId = req.user.supervisorProfile?._id;

  if (!supervisorId) {
    return res
      .status(400)
      .json(formatResponse(false, "Supervisor profile not found", null));
  }

  const { dayStatus, comment } = req.body;

  if (!dayStatus || !comment) {
    return res
      .status(400)
      .json(formatResponse(false, "Day status and comment are required", null));
  }

  const attendance = await attendanceService.reclassifyAttendance(
    attendanceId,
    supervisorId,
    dayStatus,
    comment
  );

  res.json(
    formatResponse(true, "Attendance reclassified successfully", attendance)
  );
});

/**
 * Get attendance summary for a student
 * GET /api/v1/attendance/summary/:studentId
 * @access Student (own), Supervisor, Coordinator, Admin
 */
const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const summary = await attendanceService.getAttendanceSummary(
    studentId,
    req.user
  );

  res.json(
    formatResponse(true, "Attendance summary retrieved successfully", summary)
  );
});

/**
 * Mark students as absent for a specific date
 * POST /api/v1/attendance/mark-absent
 * @access Coordinator, Admin
 */
const markAbsentForDate = asyncHandler(async (req, res) => {
  const { date } = req.body; // Optional: specific date, defaults to yesterday

  const absentRecords = await attendanceService.markAbsent(date);

  res.json(
    formatResponse(
      true,
      `Marked ${absentRecords.length} students as absent`,
      absentRecords,
      { count: absentRecords.length }
    )
  );
});

module.exports = {
  checkIn,
  checkOut,
  getTodayCheckIn,
  getMyAttendance,
  getMyStats,
  getStudentAttendance,
  getStudentStats,
  getPlacementAttendance,
  acknowledgeAttendance,
  submitAbsenceRequest,
  approveAttendance,
  rejectAttendance,
  reclassifyAttendance,
  getAttendanceSummary,
  markAbsentForDate,
};
