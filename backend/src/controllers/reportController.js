/**
 * Report Controller
 * HTTP request handlers for reports and analytics
 */

const { reportService } = require("../services");
const { HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

/**
 * @desc    Get department statistics
 * @route   GET /api/v1/reports/departments/:departmentId/statistics
 * @access  Private (Coordinator, Admin)
 */
const getDepartmentStatistics = catchAsync(async (req, res) => {
  const stats = await reportService.getDepartmentStatistics(
    req.params.departmentId
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Department statistics retrieved successfully",
    data: stats,
  });
});

/**
 * @desc    Get faculty statistics
 * @route   GET /api/v1/reports/faculties/:facultyId/statistics
 * @access  Private (Admin)
 */
const getFacultyStatistics = catchAsync(async (req, res) => {
  const stats = await reportService.getFacultyStatistics(req.params.facultyId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Faculty statistics retrieved successfully",
    data: stats,
  });
});

/**
 * @desc    Get institutional overview
 * @route   GET /api/v1/reports/institutional-overview
 * @access  Private (Admin)
 */
const getInstitutionalOverview = catchAsync(async (req, res) => {
  const overview = await reportService.getInstitutionalOverview();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Institutional overview retrieved successfully",
    data: overview,
  });
});

/**
 * @desc    Get student progress report
 * @route   GET /api/v1/reports/students/:studentId/progress
 * @access  Private
 */
const getStudentProgressReport = catchAsync(async (req, res) => {
  const report = await reportService.getStudentProgressReport(
    req.params.studentId
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Student progress report retrieved successfully",
    data: report,
  });
});

/**
 * @desc    Get supervisor performance report
 * @route   GET /api/v1/reports/supervisors/:supervisorId/performance
 * @access  Private (Coordinator, Admin)
 */
const getSupervisorPerformanceReport = catchAsync(async (req, res) => {
  const report = await reportService.getSupervisorPerformanceReport(
    req.params.supervisorId
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Supervisor performance report retrieved successfully",
    data: report,
  });
});

/**
 * @desc    Get placement report
 * @route   GET /api/v1/reports/placements
 * @access  Private (Coordinator, Admin)
 */
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

/**
 * @desc    Export student report
 * @route   GET /api/v1/reports/students/:studentId/export
 * @access  Private
 */
const exportStudentReport = catchAsync(async (req, res) => {
  const reportData = await reportService.exportStudentReport(
    req.params.studentId
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
