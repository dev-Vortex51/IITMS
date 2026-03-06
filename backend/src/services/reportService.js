const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  PLACEMENT_STATUS,
  ASSESSMENT_STATUS,
  LOGBOOK_STATUS,
} = require("../utils/constants");
const logger = require("../utils/logger");

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
        where: { status: PLACEMENT_STATUS.APPROVED },
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
        placement: { where: { status: "approved" }, take: 1 },
        departmentalSupervisor: true,
        industrialSupervisor: true,
        user: true,
      },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    const [logbooks, assessments] = await Promise.all([
      prisma.logbook.findMany({
        where: { studentId },
        include: { evidence: true, reviews: true },
        orderBy: { weekNumber: "asc" },
      }),
      prisma.assessment.findMany({
        where: { studentId },
        include: { supervisor: true },
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

    let finalGrade = null;
    const departmentalAssessment = assessments.find(
      (a) =>
        a.type === "departmental" && a.status === ASSESSMENT_STATUS.COMPLETED,
    );
    const industrialAssessment = assessments.find(
      (a) =>
        a.type === "industrial" && a.status === ASSESSMENT_STATUS.COMPLETED,
    );

    if (departmentalAssessment && industrialAssessment) {
      const deptScore = Math.round(
        (departmentalAssessment.technical +
          departmentalAssessment.communication +
          departmentalAssessment.punctuality +
          departmentalAssessment.initiative +
          departmentalAssessment.teamwork) /
          5,
      );
      const indScore = Math.round(
        (industrialAssessment.technical +
          industrialAssessment.communication +
          industrialAssessment.punctuality +
          industrialAssessment.initiative +
          industrialAssessment.teamwork) /
          5,
      );
      const finalScore = Math.round(deptScore * 0.4 + indScore * 0.6);
      const gradeMap = {
        A: finalScore >= 90,
        B: finalScore >= 80,
        C: finalScore >= 70,
        D: finalScore >= 60,
      };
      const grade = Object.keys(gradeMap).find((g) => gradeMap[g]) || "F";
      finalGrade = { score: finalScore, grade };
    }

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

module.exports = {
  getDepartmentStatistics,
  getFacultyStatistics,
  getInstitutionalOverview,
  getStudentProgressReport,
  getSupervisorPerformanceReport,
  getPlacementReport,
  exportStudentReport,
};
