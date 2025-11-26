/**
 * Assessment Service
 * Business logic for student assessment and evaluation
 */

const { Assessment, Student, Supervisor } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  ASSESSMENT_STATUS,
  ASSESSMENT_TYPES,
  NOTIFICATION_TYPES,
} = require("../utils/constants");
const { parsePagination, buildPaginationMeta } = require("../utils/helpers");
const logger = require("../utils/logger");
const notificationService = require("./notificationService");

/**
 * Create assessment
 */
const createAssessment = async (assessmentData, supervisorId) => {
  const { student: studentId, type } = assessmentData;

  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
  }

  const supervisor = await Supervisor.findById(supervisorId);
  if (!supervisor) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
  }

  // Verify supervisor is assigned to student
  if (!supervisor.assignedStudents.includes(studentId)) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You are not assigned to this student"
    );
  }

  // Check if assessment already exists
  const existingAssessment = await Assessment.findOne({
    student: studentId,
    supervisor: supervisorId,
    type,
  });

  if (existingAssessment) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `${type} assessment already exists for this student`
    );
  }

  const assessment = await Assessment.create({
    ...assessmentData,
    supervisor: supervisorId,
    status: ASSESSMENT_STATUS.PENDING,
  });

  logger.info(`Assessment created for student: ${student.matricNumber}`);

  return assessment;
};

/**
 * Get assessments with filters
 */
const getAssessments = async (filters = {}, pagination = {}) => {
  const { page, limit, skip } = parsePagination(pagination);

  const query = {};

  if (filters.student) query.student = filters.student;
  if (filters.supervisor) query.supervisor = filters.supervisor;
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;

  // Filter by department if specified
  if (filters.department) {
    const Student = require("../models/Student");
    const students = await Student.find({
      department: filters.department,
    }).select("_id");
    query.student = { $in: students.map((s) => s._id) };
  }

  const assessments = await Assessment.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Assessment.countDocuments(query);

  return {
    assessments,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Get assessment by ID
 */
const getAssessmentById = async (assessmentId) => {
  const assessment = await Assessment.findById(assessmentId);

  if (!assessment) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Assessment not found");
  }

  return assessment;
};

/**
 * Update assessment
 */
const updateAssessment = async (assessmentId, updateData, supervisorId) => {
  const assessment = await Assessment.findById(assessmentId);

  if (!assessment) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Assessment not found");
  }

  if (assessment.supervisor.toString() !== supervisorId.toString()) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You can only update your own assessments"
    );
  }

  if (assessment.status === ASSESSMENT_STATUS.COMPLETED) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Cannot update completed assessment"
    );
  }

  Object.assign(assessment, updateData);
  await assessment.save();

  logger.info(`Assessment updated: ${assessmentId}`);

  return assessment;
};

/**
 * Submit assessment
 */
const submitAssessment = async (assessmentId, supervisorId) => {
  const assessment = await Assessment.findById(assessmentId);

  if (!assessment) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Assessment not found");
  }

  if (assessment.supervisor.toString() !== supervisorId.toString()) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You can only submit your own assessments"
    );
  }

  if (assessment.status === ASSESSMENT_STATUS.SUBMITTED) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Assessment already submitted");
  }

  await assessment.submit();

  // Notify student
  const student = await Student.findById(assessment.student);
  await notificationService.createNotification({
    recipient: student.user,
    type: NOTIFICATION_TYPES.ASSESSMENT_SUBMITTED,
    title: "Assessment Submitted",
    message: `Your ${assessment.type} assessment has been submitted`,
    priority: "high",
    relatedModel: "Assessment",
    relatedId: assessment._id,
  });

  logger.info(`Assessment submitted: ${assessmentId}`);

  return assessment;
};

/**
 * Verify assessment (by coordinator)
 */
const verifyAssessment = async (assessmentId, coordinatorId, comment = "") => {
  const assessment = await Assessment.findById(assessmentId);

  if (!assessment) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Assessment not found");
  }

  if (assessment.status !== ASSESSMENT_STATUS.SUBMITTED) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Assessment must be submitted before verification"
    );
  }

  await assessment.verify(coordinatorId, comment);

  // Notify student
  const student = await Student.findById(assessment.student);
  await notificationService.createNotification({
    recipient: student.user,
    type: NOTIFICATION_TYPES.GENERAL,
    title: "Assessment Verified",
    message: `Your ${assessment.type} assessment has been verified. Grade: ${assessment.grade}`,
    priority: "high",
    relatedModel: "Assessment",
    relatedId: assessment._id,
  });

  logger.info(`Assessment verified: ${assessmentId}`);

  return assessment;
};

/**
 * Get student final grade
 */
const getStudentFinalGrade = async (studentId) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
  }

  const departmentalAssessment = await Assessment.findOne({
    student: studentId,
    type: ASSESSMENT_TYPES.DEPARTMENTAL,
    status: ASSESSMENT_STATUS.COMPLETED,
  });

  const industrialAssessment = await Assessment.findOne({
    student: studentId,
    type: ASSESSMENT_TYPES.INDUSTRIAL,
    status: ASSESSMENT_STATUS.COMPLETED,
  });

  if (!departmentalAssessment || !industrialAssessment) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Both departmental and industrial assessments must be completed"
    );
  }

  const finalGrade =
    departmentalAssessment.calculateFinalGrade(industrialAssessment);

  return {
    student,
    departmentalAssessment,
    industrialAssessment,
    finalGrade,
  };
};

/**
 * Get assessments by student
 */
const getStudentAssessments = async (studentId) => {
  const assessments = await Assessment.findByStudent(studentId);

  const summary = {
    total: assessments.length,
    pending: assessments.filter((a) => a.status === ASSESSMENT_STATUS.PENDING)
      .length,
    submitted: assessments.filter(
      (a) => a.status === ASSESSMENT_STATUS.SUBMITTED
    ).length,
    completed: assessments.filter(
      (a) => a.status === ASSESSMENT_STATUS.COMPLETED
    ).length,
    assessments,
  };

  return summary;
};

/**
 * Get pending assessments for supervisor
 */
const getSupervisorPendingAssessments = async (supervisorId) => {
  const assessments = await Assessment.findPending(supervisorId);

  return assessments;
};

module.exports = {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  submitAssessment,
  verifyAssessment,
  getStudentFinalGrade,
  getStudentAssessments,
  getSupervisorPendingAssessments,
};
