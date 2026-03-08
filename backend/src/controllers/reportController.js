const { reportService } = require("../services");
const { HTTP_STATUS, ROLES } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");
const { ApiError } = require("../middleware/errorHandler");

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

  const format = req.query.format === "excel" ? "excel" : "pdf";
  const columns = [
    { key: "label", label: "Metric" },
    { key: "value", label: "Value" },
  ];

  const rows = [
    { label: "Student", value: `${reportData.student?.user?.firstName || ""} ${reportData.student?.user?.lastName || ""}`.trim() },
    { label: "Matric Number", value: reportData.student?.matricNumber || "" },
    { label: "Training Progress", value: `${reportData.trainingProgress || 0}%` },
    { label: "Logbooks Total", value: reportData.logbookStats?.total || 0 },
    { label: "Logbooks Approved", value: reportData.logbookStats?.approved || 0 },
    { label: "Assessments Completed", value: reportData.assessmentStats?.completed || 0 },
    {
      label: "Final Grade",
      value: reportData.finalGrade
        ? `${reportData.finalGrade.grade} (${reportData.finalGrade.score})`
        : "N/A",
    },
  ];

  const { createCsvBuffer, createPdfBuffer } = require("../utils/reportExport");
  if (format === "excel") {
    const buffer = createCsvBuffer(columns, rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=\"student-progress-${req.params.studentId}.csv\"`,
    );
    return res.status(HTTP_STATUS.OK).send(buffer);
  }

  const buffer = await createPdfBuffer({
    title: "Student Progress Report",
    subtitle: reportData.student?.matricNumber || "",
    generatedAt: new Date().toISOString(),
    columns,
    rows,
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=\"student-progress-${req.params.studentId}.pdf\"`,
  );
  return res.status(HTTP_STATUS.OK).send(buffer);
});

const exportReport = catchAsync(async (req, res) => {
  const format = req.query.format === "excel" ? "excel" : "pdf";
  const reportType = req.params.reportType;

  const adminOnlyTypes = new Set(["institutional-overview"]);
  if (adminOnlyTypes.has(reportType) && req.user.role !== ROLES.ADMIN) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "Forbidden");
  }

  const payload = {
    departmentId: req.query.departmentId,
    facultyId: req.query.facultyId,
    status: req.query.status,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  };

  const result = await reportService.generateExportReport(
    reportType,
    format,
    payload,
  );

  res.setHeader("Content-Type", result.mimeType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=\"${result.filename}\"`,
  );
  return res.status(HTTP_STATUS.OK).send(result.buffer);
});

module.exports = {
  getDepartmentStatistics,
  getFacultyStatistics,
  getInstitutionalOverview,
  getStudentProgressReport,
  getSupervisorPerformanceReport,
  getPlacementReport,
  exportStudentReport,
  exportReport,
};
