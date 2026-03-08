const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  PLACEMENT_STATUS,
  ASSESSMENT_STATUS,
  LOGBOOK_STATUS,
} = require("../utils/constants");
const { calculateSystemContinuousScore } = require("./assessment/systemScore");
const logger = require("../utils/logger");
const { createCsvBuffer, createPdfBuffer } = require("../utils/reportExport");

const prisma = getPrismaClient();

/**
 * Get department statistics
 */
const getDepartmentStatistics = async (departmentId) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    const [
      totalStudents,
      placedStudents,
      pendingPlacements,
      totalSupervisors,
      completedAssessments,
    ] = await Promise.all([
      prisma.student.count({
        where: { departmentId, isActive: true },
      }),
      prisma.student.count({
        where: {
          departmentId,
          hasPlacement: true,
          placementApproved: true,
          isActive: true,
        },
      }),
      prisma.placement.count({
        where: {
          status: PLACEMENT_STATUS.PENDING,
        },
      }),
      prisma.supervisor.count({
        where: { departmentId, isActive: true },
      }),
      prisma.assessment.count({
        where: { status: ASSESSMENT_STATUS.COMPLETED },
      }),
    ]);

    const unplacedStudents = totalStudents - placedStudents;
    const placementRate =
      totalStudents > 0
        ? ((placedStudents / totalStudents) * 100).toFixed(2)
        : 0;

    return {
      department,
      statistics: {
        totalStudents,
        placedStudents,
        unplacedStudents,
        placementRate,
        pendingPlacements,
        totalSupervisors,
        completedAssessments,
      },
    };
  } catch (error) {
    logger.error(`Error getting department statistics: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get faculty statistics
 */
const getFacultyStatistics = async (facultyId) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: { departments: true },
    });

    if (!faculty) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found");
    }

    const departmentIds = faculty.departments.map((d) => d.id);

    const [totalStudents, placedStudents, totalSupervisors] = await Promise.all(
      [
        prisma.student.count({
          where: {
            departmentId: { in: departmentIds },
            isActive: true,
          },
        }),
        prisma.student.count({
          where: {
            departmentId: { in: departmentIds },
            hasPlacement: true,
            placementApproved: true,
            isActive: true,
          },
        }),
        prisma.supervisor.count({
          where: {
            departmentId: { in: departmentIds },
            isActive: true,
          },
        }),
      ],
    );

    const placementRate =
      totalStudents > 0
        ? ((placedStudents / totalStudents) * 100).toFixed(2)
        : 0;

    return {
      faculty,
      statistics: {
        totalDepartments: faculty.departments.length,
        totalStudents,
        placedStudents,
        placementRate,
        totalSupervisors,
      },
    };
  } catch (error) {
    logger.error(`Error getting faculty statistics: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get institutional overview
 */
const getInstitutionalOverview = async () => {
  try {
    const monthlyTrendStart = new Date();
    monthlyTrendStart.setMonth(monthlyTrendStart.getMonth() - 11);
    monthlyTrendStart.setDate(1);
    monthlyTrendStart.setHours(0, 0, 0, 0);

    const [
      totalFaculties,
      totalDepartments,
      totalStudents,
      placedStudents,
      totalSupervisors,
      pendingPlacements,
      approvedPlacements,
      completedAssessments,
      approvedPlacementsWithDates,
    ] = await Promise.all([
      prisma.faculty.count({ where: { isActive: true } }),
      prisma.department.count({ where: { isActive: true } }),
      prisma.student.count({ where: { isActive: true } }),
      prisma.student.count({
        where: {
          hasPlacement: true,
          placementApproved: true,
          isActive: true,
        },
      }),
      prisma.supervisor.count({ where: { isActive: true } }),
      prisma.placement.count({ where: { status: PLACEMENT_STATUS.PENDING } }),
      prisma.placement.count({ where: { status: PLACEMENT_STATUS.APPROVED } }),
      prisma.assessment.count({
        where: { status: ASSESSMENT_STATUS.COMPLETED },
      }),
      prisma.placement.findMany({
        where: {
          status: PLACEMENT_STATUS.APPROVED,
          approvedAt: { gte: monthlyTrendStart },
        },
        select: { approvedAt: true },
      }),
    ]);

    const unplacedStudents = totalStudents - placedStudents;
    const placementRate =
      totalStudents > 0
        ? ((placedStudents / totalStudents) * 100).toFixed(2)
        : 0;

    // Group placements by month
    const placementsByMonth = {};
    approvedPlacementsWithDates.forEach((placement) => {
      if (placement.approvedAt) {
        const date = new Date(placement.approvedAt);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, "0")}`;
        placementsByMonth[key] = (placementsByMonth[key] || 0) + 1;
      }
    });

    // Convert to sorted array (most recent first)
    const placementsByMonthArray = Object.entries(placementsByMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12);

    return {
      overview: {
        totalFaculties,
        totalDepartments,
        totalStudents,
        placedStudents,
        unplacedStudents,
        placementRate,
        totalSupervisors,
        pendingPlacements,
        approvedPlacements,
        completedAssessments,
      },
      trends: {
        placementsByMonth: placementsByMonthArray,
      },
    };
  } catch (error) {
    logger.error(`Error getting institutional overview: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get student progress report
 */
const getStudentProgressReport = async (studentId) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
      },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    const [settings, approvedPlacement, logbooks, assessments, evaluations, visits] =
      await Promise.all([
        prisma.systemSettings.findFirst({
          select: {
            systemScoreMax: true,
            defenseScoreMax: true,
            logbookWeight: true,
            evaluationWeight: true,
            assessmentWeight: true,
            visitationWeight: true,
            maxVisitations: true,
          },
        }),
        prisma.placement.findFirst({
          where: { studentId, status: PLACEMENT_STATUS.APPROVED },
          orderBy: { createdAt: "desc" },
          select: { id: true, startDate: true, endDate: true },
        }),
      prisma.logbook.findMany({
        where: { studentId },
        include: { evidence: true, reviews: true },
        orderBy: { weekNumber: "asc" },
      }),
      prisma.assessment.findMany({
        where: { studentId },
        include: { supervisor: true },
      }),
      prisma.evaluation.findMany({
        where: { studentId },
        select: { id: true, status: true, type: true, totalScore: true },
      }),
      prisma.visit.findMany({
        where: { studentId },
        select: { id: true, status: true, score: true, visitDate: true },
      }),
    ]);

    const logbookStats = {
      total: logbooks.length,
      submitted: logbooks.filter((l) => l.status !== LOGBOOK_STATUS.DRAFT)
        .length,
      approved: logbooks.filter((l) => l.status === LOGBOOK_STATUS.APPROVED)
        .length,
      rejected: logbooks.filter((l) => l.status === LOGBOOK_STATUS.REJECTED)
        .length,
    };

    const assessmentStats = {
      total: assessments.length,
      pending: assessments.filter((a) => a.status === ASSESSMENT_STATUS.PENDING)
        .length,
      submitted: assessments.filter(
        (a) => a.status === ASSESSMENT_STATUS.SUBMITTED,
      ).length,
      completed: assessments.filter(
        (a) => a.status === ASSESSMENT_STATUS.COMPLETED,
      ).length,
    };

    // Calculate training progress
    let trainingProgress = 0;
    if (student.trainingStartDate && student.trainingEndDate) {
      const now = new Date();
      const start = new Date(student.trainingStartDate);
      const end = new Date(student.trainingEndDate);

      if (now >= start && now <= end) {
        const total = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        trainingProgress = Math.round((elapsed / total) * 100);
      } else if (now > end) {
        trainingProgress = 100;
      }
    }

    const finalGrade = calculateSystemContinuousScore({
      placement: approvedPlacement,
      logbooks,
      assessments,
      evaluations,
      visits,
      scoringConfig: settings || {},
    });

    return {
      student,
      trainingProgress,
      logbookStats,
      assessmentStats,
      logbooks,
      assessments,
      finalGrade,
    };
  } catch (error) {
    logger.error(`Error getting student progress report: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Get supervisor performance report
 */
const getSupervisorPerformanceReport = async (supervisorId) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        assignedStudents: { select: { studentId: true } },
      },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    const studentIds = supervisor.assignedStudents.map((s) => s.studentId);

    const [
      totalLogbooks,
      reviewedLogbooks,
      totalAssessments,
      completedAssessments,
    ] = await Promise.all([
      prisma.logbook.count({
        where: { studentId: { in: studentIds } },
      }),
      prisma.logbookReview.count({
        where: {
          supervisorId,
        },
      }),
      prisma.assessment.count({
        where: { supervisorId },
      }),
      prisma.assessment.count({
        where: {
          supervisorId,
          status: ASSESSMENT_STATUS.COMPLETED,
        },
      }),
    ]);

    const logbookReviewRate =
      totalLogbooks > 0
        ? ((reviewedLogbooks / totalLogbooks) * 100).toFixed(2)
        : 0;

    const assessmentCompletionRate =
      totalAssessments > 0
        ? ((completedAssessments / totalAssessments) * 100).toFixed(2)
        : 0;

    const utilizationRate = (
      (supervisor.assignedStudents.length / supervisor.maxStudents) *
      100
    ).toFixed(2);

    return {
      supervisor,
      statistics: {
        assignedStudents: supervisor.assignedStudents.length,
        maxCapacity: supervisor.maxStudents,
        utilizationRate,
        totalLogbooks,
        reviewedLogbooks,
        logbookReviewRate,
        totalAssessments,
        completedAssessments,
        assessmentCompletionRate,
      },
    };
  } catch (error) {
    logger.error(
      `Error getting supervisor performance report: ${error.message}`,
    );
    throw handlePrismaError(error);
  }
};

/**
 * Get placement report
 */
const getPlacementReport = async (filters = {}) => {
  try {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    // If department filter, find students in that department
    if (filters.department) {
      where.student = {
        departmentId: filters.department,
      };
    } else if (Array.isArray(filters.departmentIds) && filters.departmentIds.length) {
      where.student = {
        departmentId: { in: filters.departmentIds },
      };
    }

    const placements = await prisma.placement.findMany({
      where,
      include: {
        student: {
          include: { user: true },
        },
        industryPartner: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const statistics = {
      total: placements.length,
      pending: placements.filter((p) => p.status === PLACEMENT_STATUS.PENDING)
        .length,
      approved: placements.filter((p) => p.status === PLACEMENT_STATUS.APPROVED)
        .length,
      rejected: placements.filter((p) => p.status === PLACEMENT_STATUS.REJECTED)
        .length,
      withdrawn: placements.filter(
        (p) => p.status === PLACEMENT_STATUS.WITHDRAWN,
      ).length,
    };

    // Company distribution
    const companyDistribution = {};
    placements.forEach((p) => {
      if (p.status === PLACEMENT_STATUS.APPROVED) {
        const companyName =
          p.industryPartner?.name || p.companyName || "Unknown Company";
        companyDistribution[companyName] =
          (companyDistribution[companyName] || 0) + 1;
      }
    });

    return {
      placements,
      statistics,
      companyDistribution,
    };
  } catch (error) {
    logger.error(`Error getting placement report: ${error.message}`);
    throw handlePrismaError(error);
  }
};

/**
 * Export student report data (for PDF generation)
 */
const exportStudentReport = async (studentId) => {
  try {
    const report = await getStudentProgressReport(studentId);

    return {
      ...report,
      generatedAt: new Date(),
      reportType: "Student Progress Report",
    };
  } catch (error) {
    logger.error(`Error exporting student report: ${error.message}`);
    throw handlePrismaError(error);
  }
};

const buildStudentsListDataset = async (options = {}) => {
  const where = { isActive: true };
  if (options.departmentId) {
    where.departmentId = options.departmentId;
  } else if (options.facultyId) {
    where.department = { facultyId: options.facultyId };
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
      department: {
        select: { name: true, code: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const columns = [
    { key: "name", label: "Student Name" },
    { key: "matricNumber", label: "Matric Number" },
    { key: "email", label: "Email" },
    { key: "department", label: "Department" },
    { key: "level", label: "Level" },
    { key: "session", label: "Session" },
    { key: "placementStatus", label: "Placement Status" },
  ];

  const rows = students.map((student) => ({
    name: `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim(),
    matricNumber: student.matricNumber,
    email: student.user?.email || "",
    department: student.department?.name || "",
    level: student.level,
    session: student.session,
    placementStatus: student.placementApproved ? "Approved" : student.hasPlacement ? "Pending" : "No Placement",
  }));

  return {
    title: "Student List Report",
    subtitle: options.departmentName
      ? `Department: ${options.departmentName}`
      : "All accessible departments",
    columns,
    rows,
    summary: [
      { label: "Total Students", value: rows.length },
      {
        label: "Approved Placements",
        value: rows.filter((row) => row.placementStatus === "Approved").length,
      },
    ],
  };
};

const buildPlacementSummaryDataset = async (options = {}) => {
  let departmentFilter = options.departmentId;
  let departmentIds = null;
  if (!departmentFilter && options.facultyId) {
    const departments = await prisma.department.findMany({
      where: { facultyId: options.facultyId },
      select: { id: true },
    });
    departmentIds = departments.map((item) => item.id);
  }

  const report = await getPlacementReport({
    department: departmentFilter || undefined,
    departmentIds: departmentIds || undefined,
    status: options.status,
    startDate: options.startDate,
    endDate: options.endDate,
  });

  const columns = [
    { key: "studentName", label: "Student Name" },
    { key: "matricNumber", label: "Matric Number" },
    { key: "company", label: "Company" },
    { key: "position", label: "Role" },
    { key: "status", label: "Status" },
    { key: "submittedAt", label: "Submitted At" },
  ];

  const rows = report.placements.map((placement) => ({
    studentName: `${placement.student?.user?.firstName || ""} ${placement.student?.user?.lastName || ""}`.trim(),
    matricNumber: placement.student?.matricNumber || "",
    company: placement.industryPartner?.name || placement.companyName || "",
    position: placement.position || "",
    status: placement.status || "",
    submittedAt: new Date(placement.createdAt).toLocaleDateString(),
  }));

  return {
    title: "Placement Summary Report",
    subtitle: options.departmentName
      ? `Department: ${options.departmentName}`
      : "All accessible departments",
    columns,
    rows,
    summary: [
      { label: "Total", value: report.statistics.total },
      { label: "Pending", value: report.statistics.pending },
      { label: "Approved", value: report.statistics.approved },
      { label: "Rejected", value: report.statistics.rejected },
      { label: "Withdrawn", value: report.statistics.withdrawn },
    ],
  };
};

const buildSupervisorSummaryDataset = async (options = {}) => {
  const where = { isActive: true };
  if (options.departmentId) {
    where.departmentId = options.departmentId;
  } else if (options.facultyId) {
    where.department = { facultyId: options.facultyId };
  }

  const supervisors = await prisma.supervisor.findMany({
    where,
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
      department: {
        select: { name: true },
      },
      assignedStudents: {
        where: { status: "active" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const columns = [
    { key: "name", label: "Supervisor Name" },
    { key: "email", label: "Email" },
    { key: "type", label: "Type" },
    { key: "department", label: "Department" },
    { key: "assignedStudents", label: "Assigned Students" },
    { key: "maxStudents", label: "Capacity" },
  ];

  const rows = supervisors.map((supervisor) => ({
    name: `${supervisor.user?.firstName || ""} ${supervisor.user?.lastName || ""}`.trim(),
    email: supervisor.user?.email || "",
    type: supervisor.type || "",
    department: supervisor.department?.name || "",
    assignedStudents: supervisor.assignedStudents.length,
    maxStudents: supervisor.maxStudents,
  }));

  return {
    title: "Supervisor Summary Report",
    subtitle: options.departmentName
      ? `Department: ${options.departmentName}`
      : "All accessible departments",
    columns,
    rows,
    summary: [{ label: "Total Supervisors", value: rows.length }],
  };
};

const buildAssessmentSummaryDataset = async (options = {}) => {
  const where = {};
  if (options.departmentId) {
    where.student = { departmentId: options.departmentId };
  } else if (options.facultyId) {
    where.student = { department: { facultyId: options.facultyId } };
  }

  const assessments = await prisma.assessment.findMany({
    where,
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          department: { select: { name: true } },
        },
      },
      supervisor: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const columns = [
    { key: "studentName", label: "Student Name" },
    { key: "matricNumber", label: "Matric Number" },
    { key: "department", label: "Department" },
    { key: "type", label: "Assessment Type" },
    { key: "status", label: "Status" },
    { key: "grade", label: "Grade" },
    { key: "supervisor", label: "Supervisor" },
  ];

  const rows = assessments.map((assessment) => ({
    studentName: `${assessment.student?.user?.firstName || ""} ${assessment.student?.user?.lastName || ""}`.trim(),
    matricNumber: assessment.student?.matricNumber || "",
    department: assessment.student?.department?.name || "",
    type: assessment.type || "",
    status: assessment.status || "",
    grade: assessment.grade || "",
    supervisor: `${assessment.supervisor?.user?.firstName || ""} ${assessment.supervisor?.user?.lastName || ""}`.trim(),
  }));

  return {
    title: "Assessment Summary Report",
    subtitle: options.departmentName
      ? `Department: ${options.departmentName}`
      : "All accessible departments",
    columns,
    rows,
    summary: [
      { label: "Total Assessments", value: rows.length },
      {
        label: "Completed",
        value: rows.filter((row) => row.status === "completed").length,
      },
    ],
  };
};

const buildInstitutionalOverviewDataset = async () => {
  const data = await getInstitutionalOverview();
  const overview = data.overview || {};
  const trends = data.trends?.placementsByMonth || [];

  const columns = [
    { key: "month", label: "Month" },
    { key: "count", label: "Approved Placements" },
  ];

  return {
    title: "Institutional Overview Report",
    subtitle: "SIWES institutional metrics and placement trend",
    columns,
    rows: trends,
    summary: [
      { label: "Total Faculties", value: overview.totalFaculties || 0 },
      { label: "Total Departments", value: overview.totalDepartments || 0 },
      { label: "Total Students", value: overview.totalStudents || 0 },
      { label: "Placed Students", value: overview.placedStudents || 0 },
      { label: "Placement Rate", value: `${overview.placementRate || 0}%` },
      { label: "Pending Placements", value: overview.pendingPlacements || 0 },
      { label: "Approved Placements", value: overview.approvedPlacements || 0 },
    ],
  };
};

const resolveDepartmentInfo = async (departmentId) => {
  if (!departmentId) {
    return null;
  }
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { id: true, name: true },
  });
  return department || null;
};

const generateExportReport = async (reportType, format = "pdf", options = {}) => {
  try {
    const normalizedFormat = format === "excel" ? "excel" : "pdf";
    const department = await resolveDepartmentInfo(options.departmentId);
    const enrichedOptions = {
      ...options,
      departmentName: department?.name || null,
    };

    let dataset;
    switch (reportType) {
      case "institutional-overview":
        dataset = await buildInstitutionalOverviewDataset();
        break;
      case "students-list":
        dataset = await buildStudentsListDataset(enrichedOptions);
        break;
      case "placements-summary":
        dataset = await buildPlacementSummaryDataset(enrichedOptions);
        break;
      case "supervisors-summary":
        dataset = await buildSupervisorSummaryDataset(enrichedOptions);
        break;
      case "assessments-summary":
        dataset = await buildAssessmentSummaryDataset(enrichedOptions);
        break;
      default:
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Unsupported report type");
    }

    const generatedAt = new Date().toISOString();
    const slug = reportType.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

    if (normalizedFormat === "excel") {
      return {
        buffer: createCsvBuffer(dataset.columns, dataset.rows),
        mimeType: "text/csv",
        filename: `${slug}-${Date.now()}.csv`,
      };
    }

    const pdfBuffer = await createPdfBuffer({
      ...dataset,
      generatedAt,
    });
    return {
      buffer: pdfBuffer,
      mimeType: "application/pdf",
      filename: `${slug}-${Date.now()}.pdf`,
    };
  } catch (error) {
    logger.error(`Error generating export report: ${error.message}`);
    if (error instanceof ApiError) {
      throw error;
    }
    throw handlePrismaError(error);
  }
};

module.exports = {
  getDepartmentStatistics,
  getFacultyStatistics,
  getInstitutionalOverview,
  getStudentProgressReport,
  getSupervisorPerformanceReport,
  getPlacementReport,
  exportStudentReport,
  generateExportReport,
};
