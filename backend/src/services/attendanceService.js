/**
 * Attendance Service
 * Handles business logic for student attendance tracking
 */

const { Attendance, Student, Placement, Supervisor } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { USER_ROLES } = require("../utils/constants");

/**
 * Student checks in for the day
 * @param {ObjectId} studentId - Student ID
 * @param {Object} data - Check-in data (location, notes)
 * @returns {Promise<Object>} Created attendance record
 */
const checkIn = async (studentId, data = {}) => {
  // Get student and verify they have an approved placement
  const student = await Student.findById(studentId).populate(
    "currentPlacement"
  );
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (!student.hasPlacement || !student.placementApproved) {
    throw new ApiError(400, "You must have an approved placement to check in");
  }

  if (!student.currentPlacement) {
    throw new ApiError(400, "No active placement found");
  }

  // Check if already checked in today
  const hasCheckedIn = await Attendance.hasCheckedInToday(studentId);
  if (hasCheckedIn) {
    throw new ApiError(400, "You have already checked in today");
  }

  const now = new Date();

  // Create today's date at midnight for consistent querying
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create attendance record
  // Pre-save hook will automatically calculate punctuality, hoursWorked, and set flags
  const attendance = await Attendance.create({
    student: studentId,
    placement: student.currentPlacement._id,
    date: today,
    checkInTime: now,
    location: data.location || {},
    notes: data.notes || "",
    // status field is kept for backward compatibility but dayStatus is the new standard
    status: "present", // Will be updated based on checkout
  });

  return attendance.populate([
    {
      path: "student",
      select: "matricNumber user",
      populate: { path: "user", select: "firstName lastName email" },
    },
    { path: "placement", select: "companyName position" },
  ]);
};

/**
 * Student checks out for the day
 * @param {ObjectId} studentId - Student ID
 * @param {Object} data - Check-out data (location, notes)
 * @returns {Promise<Object>} Updated attendance record
 */
const checkOut = async (studentId, data = {}) => {
  // Get student
  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // Find today's check-in record
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendance = await Attendance.findOne({
    student: studentId,
    date: { $gte: today, $lt: tomorrow },
  });

  if (!attendance) {
    throw new ApiError(400, "You must check in before checking out");
  }

  if (attendance.checkOutTime) {
    throw new ApiError(400, "You have already checked out today");
  }

  const now = new Date();

  // Validate checkout time is after check-in
  if (now <= attendance.checkInTime) {
    throw new ApiError(400, "Check-out time must be after check-in time");
  }

  // Update attendance record
  attendance.checkOutTime = now;
  if (data.location) {
    attendance.location = { ...attendance.location, ...data.location };
  }
  if (data.notes) {
    attendance.notes += (attendance.notes ? "\n" : "") + data.notes;
  }

  // Set punctuality if not already set
  if (!attendance.punctuality) {
    const checkInDate = new Date(attendance.checkInTime);
    const checkInHour = checkInDate.getHours();
    const checkInMinutes = checkInDate.getMinutes();
    // Assuming work starts at 9:00 AM
    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinutes > 0);
    attendance.punctuality = isLate ? "LATE" : "ON_TIME";
  }

  // Pre-save hook will recalculate hoursWorked and dayStatus
  await attendance.save();

  return attendance.populate([
    {
      path: "student",
      select: "matricNumber user",
      populate: { path: "user", select: "firstName lastName email" },
    },
    { path: "placement", select: "companyName position" },
  ]);
};

/**
 * Get student's check-in status for today
 * @param {ObjectId} studentId - Student ID
 * @returns {Promise<Object|null>} Today's attendance record or null
 */
const getTodayCheckIn = async (studentId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendance = await Attendance.findOne({
    student: studentId,
    date: { $gte: today, $lt: tomorrow },
  }).populate([
    {
      path: "student",
      select: "matricNumber user",
      populate: { path: "user", select: "firstName lastName email" },
    },
    { path: "placement", select: "companyName position" },
  ]);

  return attendance;
};

/**
 * Get student's attendance history
 * @param {ObjectId} studentId - Student ID
 * @param {Object} filters - Optional filters (startDate, endDate, status)
 * @param {Object} user - Authenticated user
 * @returns {Promise<Array>} Attendance records
 */
const getAttendanceHistory = async (studentId, filters = {}, user) => {
  // Verify access permissions
  if (user.role === USER_ROLES.STUDENT) {
    const myStudentId = user.studentProfile?._id?.toString();
    if (!myStudentId || myStudentId !== studentId.toString()) {
      throw new ApiError(403, "You can only view your own attendance");
    }
  }

  // For coordinators, verify student is in their department
  if (user.role === USER_ROLES.COORDINATOR && user.department) {
    const student = await Student.findById(studentId);
    if (
      !student ||
      student.department.toString() !== user.department.toString()
    ) {
      throw new ApiError(403, "You can only view students in your department");
    }
  }

  // Build query
  const query = { student: studentId };

  // Date filters
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate);
    }
  }

  // Status filter
  if (
    filters.status &&
    ["present", "late", "absent"].includes(filters.status)
  ) {
    query.status = filters.status;
  }

  const attendance = await Attendance.find(query)
    .populate([
      {
        path: "student",
        select: "matricNumber user",
        populate: { path: "user", select: "firstName lastName email" },
      },
      { path: "placement", select: "companyName position" },
      {
        path: "reviewedBy",
        select: "user",
        populate: { path: "user", select: "firstName lastName" },
      },
    ])
    .sort({ date: -1 });

  return attendance;
};

/**
 * Get student's attendance statistics
 * @param {ObjectId} studentId - Student ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Attendance statistics
 */
const getAttendanceStats = async (studentId, user) => {
  // Verify access permissions
  if (user.role === USER_ROLES.STUDENT) {
    const myStudentId = user.studentProfile?._id?.toString();
    if (!myStudentId || myStudentId !== studentId.toString()) {
      throw new ApiError(403, "You can only view your own statistics");
    }
  }

  // For coordinators, verify student is in their department
  if (user.role === USER_ROLES.COORDINATOR && user.department) {
    const student = await Student.findById(studentId);
    if (
      !student ||
      student.department.toString() !== user.department.toString()
    ) {
      throw new ApiError(403, "You can only view students in your department");
    }
  }

  const stats = await Attendance.getAttendanceStats(studentId);

  // Calculate streak (consecutive days present)
  const recentAttendance = await Attendance.find({ student: studentId })
    .sort({ date: -1 })
    .limit(30)
    .select("status date");

  let currentStreak = 0;
  for (const record of recentAttendance) {
    if (record.status === "present" || record.status === "late") {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    ...stats,
    currentStreak,
  };
};

/**
 * Get attendance records for a placement (for supervisors)
 * @param {ObjectId} placementId - Placement ID
 * @param {Object} filters - Optional filters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Array>} Attendance records
 */
const getPlacementAttendance = async (placementId, filters = {}, user) => {
  // Verify supervisor has access to this placement
  const placement = await Placement.findById(placementId);
  if (!placement) {
    throw new ApiError(404, "Placement not found");
  }

  // Check if user is supervisor for this placement
  const isSupervisor =
    user.role === USER_ROLES.ACADEMIC_SUPERVISOR ||
    user.role === USER_ROLES.INDUSTRIAL_SUPERVISOR ||
    user.role === USER_ROLES.DEPT_SUPERVISOR;

  // Supervisors are stored as separate documents; user._id is the User, while
  // placement.industrialSupervisor/departmentalSupervisor store Supervisor ids.
  let supervisorId = user.supervisorProfile?._id;
  let supervisorDoc = null;
  if (isSupervisor) {
    supervisorDoc = await Supervisor.findOne({ user: user._id }).select(
      "_id assignedStudents"
    );
    supervisorId = supervisorId || supervisorDoc?._id;
  }

  // Load student to cross-check supervisor assignments
  const studentDoc = await Student.findById(placement.student).select(
    "industrialSupervisor departmentalSupervisor"
  );

  const assignedToSupervisor = supervisorDoc?.assignedStudents?.some(
    (sid) => sid.toString() === placement.student.toString()
  );

  const studentHasSupervisorMatch =
    studentDoc &&
    (studentDoc.industrialSupervisor?.toString() === user._id.toString() ||
      studentDoc.departmentalSupervisor?.toString() === user._id.toString() ||
      (supervisorId &&
        (studentDoc.industrialSupervisor?.toString() ===
          supervisorId.toString() ||
          studentDoc.departmentalSupervisor?.toString() ===
            supervisorId.toString())));

  const allowed =
    !isSupervisor ||
    placement.departmentalSupervisor?.toString() === user._id.toString() ||
    placement.industrialSupervisor?.toString() === user._id.toString() ||
    (supervisorId &&
      (placement.departmentalSupervisor?.toString() ===
        supervisorId.toString() ||
        placement.industrialSupervisor?.toString() ===
          supervisorId.toString())) ||
    assignedToSupervisor ||
    studentHasSupervisorMatch;

  if (!allowed) {
    throw new ApiError(
      403,
      "You can only view attendance for your assigned students"
    );
  }

  // Build query
  const query = { placement: placementId };

  // Date filters
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate);
    }
  }

  // Status filter
  if (
    filters.status &&
    ["present", "late", "absent"].includes(filters.status)
  ) {
    query.status = filters.status;
  }

  const attendance = await Attendance.find(query)
    .populate([
      {
        path: "student",
        select: "matricNumber user",
        populate: { path: "user", select: "firstName lastName email" },
      },
      { path: "placement", select: "companyName position" },
    ])
    .sort({ date: -1 });

  return attendance;
};

/**
 * Supervisor acknowledges student's attendance
 * @param {ObjectId} attendanceId - Attendance record ID
 * @param {ObjectId} supervisorId - Supervisor ID
 * @returns {Promise<Object>} Updated attendance record
 */
const acknowledgeAttendance = async (attendanceId, supervisorId) => {
  const attendance = await Attendance.findById(attendanceId).populate(
    "placement"
  );
  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  // Verify supervisor is assigned to this placement
  const placement = attendance.placement;
  const isAssigned =
    placement.departmentalSupervisor?.toString() === supervisorId.toString() ||
    placement.industrialSupervisor?.toString() === supervisorId.toString();

  if (!isAssigned) {
    throw new ApiError(403, "You are not assigned to this student");
  }

  attendance.acknowledgedBy = supervisorId;
  attendance.acknowledgedAt = new Date();
  await attendance.save();

  return attendance.populate([
    {
      path: "student",
      select: "matricNumber user",
      populate: { path: "user", select: "firstName lastName email" },
    },
    { path: "placement", select: "companyName position" },
    {
      path: "acknowledgedBy",
      select: "user",
      populate: { path: "user", select: "firstName lastName" },
    },
  ]);
};

/**
 * Submit absence request
 * @param {ObjectId} studentId - Student ID
 * @param {Date} date - Date of absence
 * @param {String} reason - Reason for absence
 * @returns {Promise<Object>} Created attendance record with absence
 */
const submitAbsenceRequest = async (studentId, date, reason) => {
  // Get student and verify they have an approved placement
  const student = await Student.findById(studentId).populate(
    "currentPlacement"
  );
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (!student.hasPlacement || !student.placementApproved) {
    throw new ApiError(
      400,
      "You must have an approved placement to submit absence requests"
    );
  }

  if (!student.currentPlacement) {
    throw new ApiError(400, "No active placement found");
  }

  // Validate date
  const requestDate = new Date(date);
  requestDate.setHours(0, 0, 0, 0);

  // Check if attendance record already exists for this date
  const nextDay = new Date(requestDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const existingRecord = await Attendance.findOne({
    student: studentId,
    date: { $gte: requestDate, $lt: nextDay },
  });

  if (existingRecord && existingRecord.approvalStatus === "APPROVED") {
    throw new ApiError(
      400,
      "Cannot request absence for an already approved attendance"
    );
  }

  if (existingRecord && existingRecord.checkInTime) {
    throw new ApiError(
      400,
      "Cannot request absence for a day you already checked in"
    );
  }

  // Create or update absence request
  let attendance;
  if (existingRecord) {
    existingRecord.absenceReason = reason;
    existingRecord.dayStatus = "ABSENT";
    existingRecord.approvalStatus = "PENDING";
    existingRecord.punctuality = "LATE"; // Mark as LATE for absence
    attendance = await existingRecord.save();
  } else {
    attendance = await Attendance.create({
      student: studentId,
      placement: student.currentPlacement._id,
      date: requestDate,
      punctuality: "LATE", // Set punctuality for absence record
      absenceReason: reason,
      dayStatus: "ABSENT",
      approvalStatus: "PENDING",
      status: "absent", // Backward compatibility
    });
  }

  return attendance.populate([
    {
      path: "student",
      select: "matricNumber user",
      populate: { path: "user", select: "firstName lastName email" },
    },
    { path: "placement", select: "companyName position" },
  ]);
};

/**
 * Approve attendance/absence
 * @param {ObjectId} attendanceId - Attendance record ID
 * @param {ObjectId} supervisorId - Supervisor ID
 * @param {String} comment - Optional supervisor comment
 * @returns {Promise<Object>} Updated attendance record
 */
const approveAttendance = async (attendanceId, supervisorId, comment = "") => {
  const attendance = await Attendance.findById(attendanceId).populate(
    "placement"
  );
  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  // Verify supervisor is assigned (by placement fields, student fields, or assignedStudents)
  const placement = attendance.placement;

  // Resolve Supervisor doc (supervisorId is a User id from auth; placement stores Supervisor ids)
  const supervisorDoc = await Supervisor.findOne({
    $or: [{ _id: supervisorId }, { user: supervisorId }],
  }).select("_id assignedStudents");

  const supervisorEntityId = supervisorDoc?._id || supervisorId;

  // Load student to cross-check supervisor assignments
  const studentDoc = await Student.findById(placement.student).select(
    "industrialSupervisor departmentalSupervisor"
  );

  const placementMatch =
    placement.departmentalSupervisor?.toString() ===
      supervisorEntityId.toString() ||
    placement.industrialSupervisor?.toString() ===
      supervisorEntityId.toString();

  const studentMatch =
    studentDoc &&
    (studentDoc.departmentalSupervisor?.toString() ===
      supervisorEntityId.toString() ||
      studentDoc.industrialSupervisor?.toString() ===
        supervisorEntityId.toString());

  const assignedListMatch = supervisorDoc?.assignedStudents?.some(
    (sid) => sid.toString() === placement.student.toString()
  );

  const isAssigned = placementMatch || studentMatch || assignedListMatch;

  if (!isAssigned) {
    throw new ApiError(403, "You are not assigned to this student");
  }

  // Update approval status
  attendance.approvalStatus = "APPROVED";
  attendance.reviewedBy = supervisorId;
  attendance.reviewedAt = new Date();
  if (comment) {
    attendance.supervisorComment = comment;
  }

  // If absence was approved, change status to EXCUSED_ABSENCE
  if (attendance.dayStatus === "ABSENT" && attendance.absenceReason) {
    attendance.dayStatus = "EXCUSED_ABSENCE";
  }

  await attendance.save();

  return attendance.populate([
    {
      path: "student",
      select: "matricNumber user",
      populate: { path: "user", select: "firstName lastName email" },
    },
    { path: "placement", select: "companyName position" },
    {
      path: "reviewedBy",
      select: "user",
      populate: { path: "user", select: "firstName lastName" },
    },
  ]);
};

/**
 * Reject attendance/absence
 * @param {ObjectId} attendanceId - Attendance record ID
 * @param {ObjectId} supervisorId - Supervisor ID
 * @param {String} comment - Rejection reason
 * @returns {Promise<Object>} Updated attendance record
 */
const rejectAttendance = async (attendanceId, supervisorId, comment) => {
  const attendance = await Attendance.findById(attendanceId).populate(
    "placement"
  );
  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  // Verify supervisor is assigned (by placement fields, student fields, or assignedStudents)
  const placement = attendance.placement;

  // Resolve Supervisor doc (supervisorId is a User id from auth; placement stores Supervisor ids)
  const supervisorDoc = await Supervisor.findOne({
    $or: [{ _id: supervisorId }, { user: supervisorId }],
  }).select("_id assignedStudents");

  const supervisorEntityId = supervisorDoc?._id || supervisorId;

  // Load student to cross-check supervisor assignments
  const studentDoc = await Student.findById(placement.student).select(
    "industrialSupervisor departmentalSupervisor"
  );

  const placementMatch =
    placement.departmentalSupervisor?.toString() ===
      supervisorEntityId.toString() ||
    placement.industrialSupervisor?.toString() ===
      supervisorEntityId.toString();

  const studentMatch =
    studentDoc &&
    (studentDoc.departmentalSupervisor?.toString() ===
      supervisorEntityId.toString() ||
      studentDoc.industrialSupervisor?.toString() ===
        supervisorEntityId.toString());

  const assignedListMatch = supervisorDoc?.assignedStudents?.some(
    (sid) => sid.toString() === placement.student.toString()
  );

  const isAssigned = placementMatch || studentMatch || assignedListMatch;

  if (!isAssigned) {
    throw new ApiError(403, "You are not assigned to this student");
  }

  // Update approval status
  attendance.approvalStatus = "REJECTED";
  attendance.reviewedBy = supervisorId;
  attendance.reviewedAt = new Date();
  attendance.supervisorComment = comment || "Request rejected";

  await attendance.save();

  return attendance.populate([
    {
      path: "student",
      select: "matricNumber user",
      populate: { path: "user", select: "firstName lastName email" },
    },
    { path: "placement", select: "companyName position" },
    {
      path: "reviewedBy",
      select: "user",
      populate: { path: "user", select: "firstName lastName" },
    },
  ]);
};

/**
 * Reclassify attendance day status
 * @param {ObjectId} attendanceId - Attendance record ID
 * @param {ObjectId} supervisorId - Supervisor ID
 * @param {String} newDayStatus - New day status (HALF_DAY, PRESENT_ON_TIME, etc.)
 * @param {String} comment - Reason for reclassification
 * @returns {Promise<Object>} Updated attendance record
 */
const reclassifyAttendance = async (
  attendanceId,
  supervisorId,
  newDayStatus,
  comment
) => {
  const attendance = await Attendance.findById(attendanceId).populate(
    "placement"
  );
  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  // Verify supervisor is assigned (by placement fields, student fields, or assignedStudents)
  const placement = attendance.placement;

  // Resolve Supervisor doc (supervisorId is a User id from auth; placement stores Supervisor ids)
  const supervisorDoc = await Supervisor.findOne({
    $or: [{ _id: supervisorId }, { user: supervisorId }],
  }).select("_id assignedStudents");

  const supervisorEntityId = supervisorDoc?._id || supervisorId;

  // Load student to cross-check supervisor assignments
  const studentDoc = await Student.findById(placement.student).select(
    "industrialSupervisor departmentalSupervisor"
  );

  const placementMatch =
    placement.departmentalSupervisor?.toString() ===
      supervisorEntityId.toString() ||
    placement.industrialSupervisor?.toString() ===
      supervisorEntityId.toString();

  const studentMatch =
    studentDoc &&
    (studentDoc.departmentalSupervisor?.toString() ===
      supervisorEntityId.toString() ||
      studentDoc.industrialSupervisor?.toString() ===
        supervisorEntityId.toString());

  const assignedListMatch = supervisorDoc?.assignedStudents?.some(
    (sid) => sid.toString() === placement.student.toString()
  );

  const isAssigned = placementMatch || studentMatch || assignedListMatch;

  if (!isAssigned) {
    throw new ApiError(403, "You are not assigned to this student");
  }

  // Validate new day status
  const validStatuses = [
    "PRESENT_ON_TIME",
    "PRESENT_LATE",
    "HALF_DAY",
    "ABSENT",
    "EXCUSED_ABSENCE",
    "INCOMPLETE",
  ];
  if (!validStatuses.includes(newDayStatus)) {
    throw new ApiError(400, "Invalid day status");
  }

  // Update day status
  attendance.dayStatus = newDayStatus;
  attendance.approvalStatus = "NEEDS_REVIEW"; // Mark for review after reclassification
  attendance.reviewedBy = supervisorId;
  attendance.reviewedAt = new Date();
  attendance.supervisorComment = comment || `Reclassified to ${newDayStatus}`;

  await attendance.save();

  return attendance.populate([
    {
      path: "student",
      select: "matricNumber user",
      populate: { path: "user", select: "firstName lastName email" },
    },
    { path: "placement", select: "companyName position" },
    {
      path: "reviewedBy",
      select: "user",
      populate: { path: "user", select: "firstName lastName" },
    },
  ]);
};

/**
 * Get attendance summary for a student
 * @param {ObjectId} studentId - Student ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Attendance summary with statistics
 */
const getAttendanceSummary = async (studentId, user) => {
  // Verify access permissions
  if (user.role === USER_ROLES.STUDENT) {
    const myStudentId = user.studentProfile?._id?.toString();
    if (!myStudentId || myStudentId !== studentId.toString()) {
      throw new ApiError(403, "You can only view your own summary");
    }
  }

  // For coordinators, verify student is in their department
  if (user.role === USER_ROLES.COORDINATOR && user.department) {
    const student = await Student.findById(studentId);
    if (
      !student ||
      student.department.toString() !== user.department.toString()
    ) {
      throw new ApiError(403, "You can only view students in your department");
    }
  }

  // Get all attendance records
  const allRecords = await Attendance.find({ student: studentId });

  // Calculate statistics
  const summary = {
    total: allRecords.length,
    presentOnTime: 0,
    presentLate: 0,
    halfDay: 0,
    absent: 0,
    excusedAbsence: 0,
    incomplete: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    needsReview: 0,
    completionPercentage: 0,
    punctualityRate: 0,
    anomalies: [],
  };

  // Count by day status
  allRecords.forEach((record) => {
    switch (record.dayStatus) {
      case "PRESENT_ON_TIME":
        summary.presentOnTime++;
        break;
      case "PRESENT_LATE":
        summary.presentLate++;
        break;
      case "HALF_DAY":
        summary.halfDay++;
        break;
      case "ABSENT":
        summary.absent++;
        break;
      case "EXCUSED_ABSENCE":
        summary.excusedAbsence++;
        break;
      case "INCOMPLETE":
        summary.incomplete++;
        break;
    }

    // Count by approval status
    switch (record.approvalStatus) {
      case "PENDING":
        summary.pending++;
        break;
      case "APPROVED":
        summary.approved++;
        break;
      case "REJECTED":
        summary.rejected++;
        break;
      case "NEEDS_REVIEW":
        summary.needsReview++;
        break;
    }
  });

  // Calculate completion percentage (non-incomplete, non-absent records)
  const completedDays =
    summary.presentOnTime +
    summary.presentLate +
    summary.halfDay +
    summary.excusedAbsence;
  summary.completionPercentage =
    summary.total > 0 ? Math.round((completedDays / summary.total) * 100) : 0;

  // Calculate punctuality rate
  const presentDays = summary.presentOnTime + summary.presentLate;
  summary.punctualityRate =
    presentDays > 0
      ? Math.round((summary.presentOnTime / presentDays) * 100)
      : 0;

  // Detect anomalies
  // 1. Frequent lateness (>30% late arrivals)
  if (presentDays > 5 && summary.presentLate / presentDays > 0.3) {
    summary.anomalies.push({
      type: "FREQUENT_LATENESS",
      severity: "MEDIUM",
      description: `${Math.round(
        (summary.presentLate / presentDays) * 100
      )}% late arrivals detected`,
    });
  }

  // 2. High absence rate (>20% absent)
  if (summary.total > 5 && summary.absent / summary.total > 0.2) {
    summary.anomalies.push({
      type: "HIGH_ABSENCE_RATE",
      severity: "HIGH",
      description: `${Math.round(
        (summary.absent / summary.total) * 100
      )}% absence rate`,
    });
  }

  // 3. Many incomplete days (>15%)
  if (summary.total > 5 && summary.incomplete / summary.total > 0.15) {
    summary.anomalies.push({
      type: "FREQUENT_INCOMPLETE_DAYS",
      severity: "MEDIUM",
      description: `${summary.incomplete} incomplete days (no checkout)`,
    });
  }

  // 4. Recent consecutive absences
  const recentRecords = await Attendance.find({ student: studentId })
    .sort({ date: -1 })
    .limit(10);

  let consecutiveAbsences = 0;
  for (const record of recentRecords) {
    if (record.dayStatus === "ABSENT") {
      consecutiveAbsences++;
    } else {
      break;
    }
  }

  if (consecutiveAbsences >= 3) {
    summary.anomalies.push({
      type: "CONSECUTIVE_ABSENCES",
      severity: "HIGH",
      description: `${consecutiveAbsences} consecutive absences detected`,
    });
  }

  return summary;
};

/**
 * Mark students as absent for a specific date
 * Automatically creates absent records for all students with approved placements
 * who did not check in on that date
 * @param {Date} targetDate - Date to mark absences for (defaults to yesterday)
 * @returns {Promise<Array>} Created absent records
 */
const markAbsent = async (targetDate = null) => {
  // Default to yesterday if no date provided
  let dateToProcess = targetDate ? new Date(targetDate) : new Date();
  if (!targetDate) {
    dateToProcess.setDate(dateToProcess.getDate() - 1);
  }
  dateToProcess.setHours(0, 0, 0, 0);

  const nextDay = new Date(dateToProcess);
  nextDay.setDate(nextDay.getDate() + 1);

  // Get all students with approved placements
  const activeStudents = await Student.find({
    placementApproved: true,
    hasPlacement: true,
  }).select("_id currentPlacement");

  if (activeStudents.length === 0) {
    return [];
  }

  const studentIds = activeStudents.map((s) => s._id);

  // Find students who already have attendance records for this date
  const existingRecords = await Attendance.find({
    student: { $in: studentIds },
    date: { $gte: dateToProcess, $lt: nextDay },
  }).select("student");

  const studentsWithRecords = new Set(
    existingRecords.map((r) => r.student.toString())
  );

  // Create absent records for students without check-in
  const absentRecords = [];
  for (const student of activeStudents) {
    if (!studentsWithRecords.has(student._id.toString())) {
      const absence = await Attendance.create({
        student: student._id,
        placement: student.currentPlacement,
        date: dateToProcess,
        checkInTime: null,
        checkOutTime: null,
        dayStatus: "ABSENT",
        approvalStatus: "PENDING",
        status: "absent", // Backward compatibility
      });
      absentRecords.push(absence);
    }
  }

  return absentRecords;
};

module.exports = {
  checkIn,
  checkOut,
  getTodayCheckIn,
  getAttendanceHistory,
  getAttendanceStats,
  getPlacementAttendance,
  acknowledgeAttendance,
  submitAbsenceRequest,
  approveAttendance,
  rejectAttendance,
  reclassifyAttendance,
  getAttendanceSummary,
  markAbsent,
};
