const { evaluationService } = require("../services");
const { USER_ROLES, HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

const createEvaluation = catchAsync(async (req, res) => {
  const evaluation = await evaluationService.createEvaluation(
    req.body,
    req.user.supervisorProfile,
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Evaluation created successfully",
    data: evaluation,
  });
});

const getEvaluations = catchAsync(async (req, res) => {
  const filters = {
    student: req.query.student,
    supervisor: req.query.supervisor,
    type: req.query.type,
    status: req.query.status,
    department: req.query.department,
  };

  if (req.user.role === USER_ROLES.ACADEMIC_SUPERVISOR) {
    filters.supervisor = req.user.supervisorProfile;
  }

  if (req.user.role === USER_ROLES.COORDINATOR && req.user.departmentId) {
    filters.department = req.user.departmentId;
  }

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await evaluationService.getEvaluations(filters, pagination);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Evaluations retrieved successfully",
    data: result.evaluations,
    pagination: result.pagination,
  });
});

const getEvaluationById = catchAsync(async (req, res) => {
  const evaluation = await evaluationService.getEvaluationById(
    req.params.id,
    req.user,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Evaluation retrieved successfully",
    data: evaluation,
  });
});

const updateEvaluation = catchAsync(async (req, res) => {
  const evaluation = await evaluationService.updateEvaluation(
    req.params.id,
    req.body,
    req.user.supervisorProfile,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Evaluation updated successfully",
    data: evaluation,
  });
});

const submitEvaluation = catchAsync(async (req, res) => {
  const evaluation = await evaluationService.submitEvaluation(
    req.params.id,
    req.user.supervisorProfile,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Evaluation submitted successfully",
    data: evaluation,
  });
});

const completeEvaluation = catchAsync(async (req, res) => {
  const evaluation = await evaluationService.completeEvaluation(
    req.params.id,
    req.user,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Evaluation completed successfully",
    data: evaluation,
  });
});

module.exports = {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  updateEvaluation,
  submitEvaluation,
  completeEvaluation,
};
