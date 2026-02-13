const attendanceService = require("../services/attendanceService");
const { asyncHandler } = require("../middleware/errorHandler");
const { formatResponse } = require("../utils/helpers");

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
    }),
  );
});

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
      attendance,
    ),
  );
});

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
    req.user,
  );

  res.json(
    formatResponse(
      true,
      "Attendance history retrieved successfully",
      attendance,
      { count: attendance.length },
    ),
  );
});

const getMyStats = asyncHandler(async (req, res) => {
  const studentId = req.user.studentProfile?._id;

  if (!studentId) {
    return res
      .status(400)
      .json(formatResponse(false, "Student profile not found", null));
  }

  const stats = await attendanceService.getAttendanceStats(studentId, req.user);

  res.json(
    formatResponse(true, "Attendance statistics retrieved successfully", stats),
  );
});

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
    req.user,
  );

  res.json(
    formatResponse(
      true,
      "Student attendance retrieved successfully",
      attendance,
      { count: attendance.length },
    ),
  );
});

const getStudentStats = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const stats = await attendanceService.getAttendanceStats(studentId, req.user);

  res.json(
    formatResponse(
      true,
      "Student attendance statistics retrieved successfully",
      stats,
    ),
  );
});

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
    req.user,
  );

  res.json(
    formatResponse(
      true,
      "Placement attendance retrieved successfully",
      attendance,
      { count: attendance.length },
    ),
  );
});

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
    supervisorId,
  );

  res.json(
    formatResponse(true, "Attendance acknowledged successfully", attendance),
  );
});

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
    }),
  );
});

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
    reason,
  );

  res
    .status(201)
    .json(
      formatResponse(
        true,
        "Absence request submitted successfully",
        attendance,
      ),
    );
});

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
    comment,
  );

  res.json(
    formatResponse(true, "Attendance approved successfully", attendance),
  );
});

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
    comment,
  );

  res.json(
    formatResponse(true, "Attendance rejected successfully", attendance),
  );
});

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
    comment,
  );

  res.json(
    formatResponse(true, "Attendance reclassified successfully", attendance),
  );
});

const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const summary = await attendanceService.getAttendanceSummary(
    studentId,
    req.user,
  );

  res.json(
    formatResponse(true, "Attendance summary retrieved successfully", summary),
  );
});

const markAbsentForDate = asyncHandler(async (req, res) => {
  const { date } = req.body; // Optional: specific date, defaults to yesterday

  const absentRecords = await attendanceService.markAbsent(date);

  res.json(
    formatResponse(
      true,
      `Marked ${absentRecords.length} students as absent`,
      absentRecords,
      { count: absentRecords.length },
    ),
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
