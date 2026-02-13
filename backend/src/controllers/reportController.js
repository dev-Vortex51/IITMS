const { reportService } = require("../services");
const { HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

const getDepartmentStatistics = catchAsync(async (req, res) => {
  const stats = await reportService.getDepartmentStatistics(
    req.params.departmentId,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Department statistics retrieved successfully",
    data: stats,
  });
});

const getFacultyStatistics = catchAsync(async (req, res) => {
  const stats = await reportService.getFacultyStatistics(req.params.facultyId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Faculty statistics retrieved successfully",
    data: stats,
  });
});

const getInstitutionalOverview = catchAsync(async (req, res) => {
  const overview = await reportService.getInstitutionalOverview();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Institutional overview retrieved successfully",
    data: overview,
  });
});

const getStudentProgressReport = catchAsync(async (req, res) => {
  const report = await reportService.getStudentProgressReport(
    req.params.studentId,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student progress report retrieved successfully",
    data: report,
  });
});

const getSupervisorPerformanceReport = catchAsync(async (req, res) => {
  const report = await reportService.getSupervisorPerformanceReport(
    req.params.supervisorId,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Supervisor performance report retrieved successfully",
    data: report,
  });
});

const getPlacementReport = catchAsync(async (req, res) => {
  const filters = {
    department: req.query.department,
    status: req.query.status,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  };

  const report = await reportService.getPlacementReport(filters);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement report retrieved successfully",
    data: report,
  });
});

const exportStudentReport = catchAsync(async (req, res) => {
  const reportData = await reportService.exportStudentReport(
    req.params.studentId,
  );

  // TODO: Generate PDF using PDFKit
  // For now, return JSON data
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student report data retrieved successfully",
    data: reportData,
  });
});

module.exports = {
  getDepartmentStatistics,
  getFacultyStatistics,
  getInstitutionalOverview,
  getStudentProgressReport,
  getSupervisorPerformanceReport,
  getPlacementReport,
  exportStudentReport,
};
