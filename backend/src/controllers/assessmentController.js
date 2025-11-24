/**
 * Assessment Controller
 * HTTP request handlers for assessment management
 */

const { assessmentService } = require("../services");
const { HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

/**
 * @desc    Create assessment
 * @route   POST /api/v1/assessments
 * @access  Private (Supervisor)
 */
const createAssessment = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;

  const assessment = await assessmentService.createAssessment(
    req.body,
    supervisorId
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Assessment created successfully",
    data: assessment,
  });
});

/**
 * @desc    Get all assessments
 * @route   GET /api/v1/assessments
 * @access  Private
 */
const getAssessments = catchAsync(async (req, res) => {
  const filters = {
    student: req.query.student,
    supervisor: req.query.supervisor,
    type: req.query.type,
    status: req.query.status,
  };

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await assessmentService.getAssessments(filters, pagination);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Assessments retrieved successfully",
    data: result.assessments,
    pagination: result.pagination,
  });
});

/**
 * @desc    Get assessment by ID
 * @route   GET /api/v1/assessments/:id
 * @access  Private
 */
const getAssessmentById = catchAsync(async (req, res) => {
  const assessment = await assessmentService.getAssessmentById(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Assessment retrieved successfully",
    data: assessment,
  });
});

/**
 * @desc    Update assessment
 * @route   PUT /api/v1/assessments/:id
 * @access  Private (Supervisor - owner only)
 */
const updateAssessment = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;

  const assessment = await assessmentService.updateAssessment(
    req.params.id,
    req.body,
    supervisorId
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Assessment updated successfully",
    data: assessment,
  });
});

/**
 * @desc    Submit assessment
 * @route   POST /api/v1/assessments/:id/submit
 * @access  Private (Supervisor - owner only)
 */
const submitAssessment = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;

  const assessment = await assessmentService.submitAssessment(
    req.params.id,
    supervisorId
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Assessment submitted successfully",
    data: assessment,
  });
});

/**
 * @desc    Verify assessment
 * @route   POST /api/v1/assessments/:id/verify
 * @access  Private (Coordinator, Admin)
 */
const verifyAssessment = catchAsync(async (req, res) => {
  const { comment } = req.body;

  const assessment = await assessmentService.verifyAssessment(
    req.params.id,
    req.user._id,
    comment
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Assessment verified successfully",
    data: assessment,
  });
});

/**
 * @desc    Get student final grade
 * @route   GET /api/v1/students/:studentId/final-grade
 * @access  Private
 */
const getStudentFinalGrade = catchAsync(async (req, res) => {
  const result = await assessmentService.getStudentFinalGrade(
    req.params.studentId
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Final grade retrieved successfully",
    data: result,
  });
});

/**
 * @desc    Get student assessments
 * @route   GET /api/v1/students/:studentId/assessments
 * @access  Private
 */
const getStudentAssessments = catchAsync(async (req, res) => {
  const summary = await assessmentService.getStudentAssessments(
    req.params.studentId
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student assessments retrieved successfully",
    data: summary,
  });
});

/**
 * @desc    Get pending assessments for supervisor
 * @route   GET /api/v1/assessments/pending
 * @access  Private (Supervisor)
 */
const getSupervisorPendingAssessments = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;

  const assessments = await assessmentService.getSupervisorPendingAssessments(
    supervisorId
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Pending assessments retrieved successfully",
    data: assessments,
  });
});

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
