const { technicalReportService } = require("../services");
const { USER_ROLES, HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

const createTechnicalReport = catchAsync(async (req, res) => {
  const report = await technicalReportService.createTechnicalReport(
    req.user.studentProfile,
    req.body,
    req.file,
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Final technical report saved successfully",
    data: report,
  });
});

const updateTechnicalReport = catchAsync(async (req, res) => {
  const report = await technicalReportService.updateTechnicalReport(
    req.params.id,
    req.user.studentProfile,
    req.body,
    req.file,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Final technical report updated successfully",
    data: report,
  });
});

const getTechnicalReports = catchAsync(async (req, res) => {
  const filters = {
    student: req.query.student,
    status: req.query.status,
    department: req.query.department,
  };

  if (req.user.role === USER_ROLES.STUDENT) {
    filters.student = req.user.studentProfile;
  }

  const coordinatorDepartmentId = req.user.departmentId || req.user.department;
  if (req.user.role === USER_ROLES.COORDINATOR && coordinatorDepartmentId) {
    filters.department = coordinatorDepartmentId;
  }

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await technicalReportService.getTechnicalReports(
    filters,
    pagination,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Final technical reports retrieved successfully",
    data: result.reports,
    pagination: result.pagination,
  });
});

const getTechnicalReportById = catchAsync(async (req, res) => {
  const report = await technicalReportService.getTechnicalReportById(
    req.params.id,
    req.user,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Final technical report retrieved successfully",
    data: report,
  });
});

const submitTechnicalReport = catchAsync(async (req, res) => {
  const report = await technicalReportService.submitTechnicalReport(
    req.params.id,
    req.user.studentProfile,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Final technical report submitted successfully",
    data: report,
  });
});

const reviewTechnicalReport = catchAsync(async (req, res) => {
  const report = await technicalReportService.reviewTechnicalReport(
    req.params.id,
    req.body,
    req.user,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Final technical report reviewed successfully",
    data: report,
  });
});

module.exports = {
  createTechnicalReport,
  updateTechnicalReport,
  getTechnicalReports,
  getTechnicalReportById,
  submitTechnicalReport,
  reviewTechnicalReport,
};
