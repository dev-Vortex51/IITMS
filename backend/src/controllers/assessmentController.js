const { assessmentService } = require("../services");
const { HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

const createAssessment = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;

  const assessment = await assessmentService.createAssessment(
    req.body,
    supervisorId,
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Assessment created successfully",
    data: assessment,
  });
});

const getAssessments = catchAsync(async (req, res) => {
  const filters = {
    student: req.query.student,
    supervisor: req.query.supervisor,
    type: req.query.type,
    status: req.query.status,
    department: req.query.department,
  };

  // If coordinator, filter by their department
  const { USER_ROLES } = require("../utils/constants");
  if (req.user.role === USER_ROLES.COORDINATOR && req.user.department) {
    filters.department = req.user.department;
  }

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

const getAssessmentById = catchAsync(async (req, res) => {
  const assessment = await assessmentService.getAssessmentById(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Assessment retrieved successfully",
    data: assessment,
  });
});

const updateAssessment = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;

  const assessment = await assessmentService.updateAssessment(
    req.params.id,
    req.body,
    supervisorId,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Assessment updated successfully",
    data: assessment,
  });
});

const submitAssessment = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;

  const assessment = await assessmentService.submitAssessment(
    req.params.id,
    supervisorId,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Assessment submitted successfully",
    data: assessment,
  });
});

const verifyAssessment = catchAsync(async (req, res) => {
  const { comment } = req.body;

  const assessment = await assessmentService.verifyAssessment(
    req.params.id,
    req.user.id,
    comment,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Assessment verified successfully",
    data: assessment,
  });
});

const getStudentFinalGrade = catchAsync(async (req, res) => {
  const result = await assessmentService.getStudentFinalGrade(
    req.params.studentId,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Final grade retrieved successfully",
    data: result,
  });
});

const getStudentAssessments = catchAsync(async (req, res) => {
  const summary = await assessmentService.getStudentAssessments(
    req.params.studentId,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student assessments retrieved successfully",
    data: summary,
  });
});

const getSupervisorPendingAssessments = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;

  const assessments =
    await assessmentService.getSupervisorPendingAssessments(supervisorId);

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
