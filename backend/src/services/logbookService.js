/**
 * Logbook Service
 * Business logic for logbook management
 */

const { Logbook, Student } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  LOGBOOK_STATUS,
  NOTIFICATION_TYPES,
} = require("../utils/constants");
const { parsePagination, buildPaginationMeta } = require("../utils/helpers");
const logger = require("../utils/logger");
const notificationService = require("./notificationService");

/**
 * Create logbook entry
 */
const createLogbookEntry = async (studentId, logbookData, files = []) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
  }

  if (!student.canSubmitLogbook()) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You cannot submit logbook. Ensure your placement is approved and training has started."
    );
  }

  // Check if logbook for this week already exists
  const existingLogbook = await Logbook.findOne({
    student: studentId,
    weekNumber: logbookData.weekNumber,
  });

  if (existingLogbook) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Logbook for week ${logbookData.weekNumber} already exists`
    );
  }

  const logbook = await Logbook.create({
    student: studentId,
    ...logbookData,
    evidence: files.map((file) => ({
      name: file.originalname,
      path: file.path,
      type: file.mimetype,
    })),
    status: LOGBOOK_STATUS.DRAFT,
  });

  logger.info(
    `Logbook entry created for student: ${student.matricNumber}, week: ${logbookData.weekNumber}`
  );

  return logbook;
};

/**
 * Get logbooks with filters
 */
const getLogbooks = async (filters = {}, pagination = {}) => {
  const { page, limit, skip } = parsePagination(pagination);

  const query = {};

  if (filters.student) query.student = filters.student;
  if (filters.status) query.status = filters.status;
  if (filters.weekNumber) query.weekNumber = filters.weekNumber;

  const logbooks = await Logbook.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ weekNumber: -1, createdAt: -1 });

  const total = await Logbook.countDocuments(query);

  return {
    logbooks,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Get logbook by ID
 */
const getLogbookById = async (logbookId) => {
  const logbook = await Logbook.findById(logbookId);

  if (!logbook) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Logbook not found");
  }

  return logbook;
};

/**
 * Update logbook entry (before submission)
 */
const updateLogbookEntry = async (logbookId, updateData, userId) => {
  const logbook = await Logbook.findById(logbookId);

  if (!logbook) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Logbook not found");
  }

  if (logbook.status !== LOGBOOK_STATUS.DRAFT) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Cannot update submitted logbook"
    );
  }

  // Verify ownership
  const student = await Student.findById(logbook.student);
  if (student.user.toString() !== userId.toString()) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You can only update your own logbook"
    );
  }

  Object.assign(logbook, updateData);
  await logbook.save();

  logger.info(`Logbook updated: ${logbookId}`);

  return logbook;
};

/**
 * Submit logbook entry
 */
const submitLogbookEntry = async (logbookId, userId) => {
  const logbook = await Logbook.findById(logbookId);

  if (!logbook) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Logbook not found");
  }

  if (logbook.status !== LOGBOOK_STATUS.DRAFT) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Logbook already submitted");
  }

  // Verify ownership
  const student = await Student.findById(logbook.student);
  if (student.user.toString() !== userId.toString()) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You can only submit your own logbook"
    );
  }

  await logbook.submit();

  // Notify supervisors
  if (student.departmentalSupervisor) {
    const Supervisor = require("../models").Supervisor;
    const deptSup = await Supervisor.findById(student.departmentalSupervisor);

    await notificationService.createNotification({
      recipient: deptSup.user,
      type: NOTIFICATION_TYPES.GENERAL,
      title: "New Logbook Submission",
      message: `${student.user.fullName} has submitted Week ${logbook.weekNumber} logbook`,
      priority: "medium",
      relatedModel: "Logbook",
      relatedId: logbook._id,
    });
  }

  if (student.industrialSupervisor) {
    const Supervisor = require("../models").Supervisor;
    const indSup = await Supervisor.findById(student.industrialSupervisor);

    await notificationService.createNotification({
      recipient: indSup.user,
      type: NOTIFICATION_TYPES.GENERAL,
      title: "New Logbook Submission",
      message: `${student.user.fullName} has submitted Week ${logbook.weekNumber} logbook`,
      priority: "medium",
      relatedModel: "Logbook",
      relatedId: logbook._id,
    });
  }

  logger.info(`Logbook submitted: ${logbookId}`);

  return logbook;
};

/**
 * Review logbook (by supervisor)
 */
const reviewLogbook = async (
  logbookId,
  reviewData,
  supervisorId,
  supervisorType
) => {
  const logbook = await Logbook.findById(logbookId);

  if (!logbook) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Logbook not found");
  }

  if (
    logbook.status !== LOGBOOK_STATUS.SUBMITTED &&
    logbook.status !== LOGBOOK_STATUS.REVIEWED
  ) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Logbook not ready for review");
  }

  // Verify supervisor is assigned to this student
  const student = await Student.findById(logbook.student);
  const Supervisor = require("../models").Supervisor;
  const supervisor = await Supervisor.findById(supervisorId);

  if (!supervisor.assignedStudents.includes(student._id)) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You are not assigned to this student"
    );
  }

  await logbook.addReview(supervisorId, supervisorType, reviewData);

  // Notify student
  await notificationService.createNotification({
    recipient: student.user,
    type: NOTIFICATION_TYPES.LOGBOOK_COMMENT,
    title: "Logbook Reviewed",
    message: `Your Week ${logbook.weekNumber} logbook has been reviewed by your ${supervisorType} supervisor`,
    priority: "medium",
    relatedModel: "Logbook",
    relatedId: logbook._id,
    createdBy: supervisor.user,
  });

  logger.info(`Logbook reviewed by ${supervisorType} supervisor: ${logbookId}`);

  return logbook;
};

/**
 * Get logbooks pending review for supervisor
 */
const getLogbooksPendingReview = async (supervisorId) => {
  const Supervisor = require("../models").Supervisor;
  const supervisor = await Supervisor.findById(supervisorId);

  if (!supervisor) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
  }

  const logbooks = await Logbook.findPendingReview(
    supervisorId,
    supervisor.type
  );

  return logbooks;
};

/**
 * Get student logbook summary
 */
const getStudentLogbookSummary = async (studentId) => {
  const totalLogbooks = await Logbook.countDocuments({ student: studentId });
  const submittedLogbooks = await Logbook.countDocuments({
    student: studentId,
    status: {
      $in: [
        LOGBOOK_STATUS.SUBMITTED,
        LOGBOOK_STATUS.REVIEWED,
        LOGBOOK_STATUS.APPROVED,
      ],
    },
  });
  const approvedLogbooks = await Logbook.countDocuments({
    student: studentId,
    status: LOGBOOK_STATUS.APPROVED,
  });
  const rejectedLogbooks = await Logbook.countDocuments({
    student: studentId,
    status: LOGBOOK_STATUS.REJECTED,
  });

  const logbooks = await Logbook.find({ student: studentId }).sort({
    weekNumber: 1,
  });

  return {
    total: totalLogbooks,
    submitted: submittedLogbooks,
    approved: approvedLogbooks,
    rejected: rejectedLogbooks,
    logbooks,
  };
};

module.exports = {
  createLogbookEntry,
  getLogbooks,
  getLogbookById,
  updateLogbookEntry,
  submitLogbookEntry,
  reviewLogbook,
  getLogbooksPendingReview,
  getStudentLogbookSummary,
};
