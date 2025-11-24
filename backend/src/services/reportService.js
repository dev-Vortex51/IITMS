/**
 * Report Service
 * Business logic for generating reports and analytics
 */

const {
  Student,
  Placement,
  Logbook,
  Assessment,
  Supervisor,
  Department,
  Faculty,
} = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  PLACEMENT_STATUS,
  ASSESSMENT_STATUS,
} = require("../utils/constants");
const logger = require("../utils/logger");

/**
 * Get department statistics
 */
const getDepartmentStatistics = async (departmentId) => {
  const department = await Department.findById(departmentId);

  if (!department) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
  }

  const totalStudents = await Student.countDocuments({
    department: departmentId,
    isActive: true,
  });

  const placedStudents = await Student.countDocuments({
    department: departmentId,
    hasPlacement: true,
    placementApproved: true,
    isActive: true,
  });

  const pendingPlacements = await Placement.countDocuments({
    status: PLACEMENT_STATUS.PENDING,
  });

  const totalSupervisors = await Supervisor.countDocuments({
    department: departmentId,
    isActive: true,
  });

  const completedAssessments = await Assessment.countDocuments({
    status: ASSESSMENT_STATUS.COMPLETED,
  });

  return {
    department,
    statistics: {
      totalStudents,
      placedStudents,
      unplacedStudents: totalStudents - placedStudents,
      placementRate:
        totalStudents > 0
          ? ((placedStudents / totalStudents) * 100).toFixed(2)
          : 0,
      pendingPlacements,
      totalSupervisors,
      completedAssessments,
    },
  };
};

/**
 * Get faculty statistics
 */
const getFacultyStatistics = async (facultyId) => {
  const faculty = await Faculty.findById(facultyId).populate("departments");

  if (!faculty) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found");
  }

  const departmentIds = faculty.departments.map((d) => d._id);

  const totalStudents = await Student.countDocuments({
    department: { $in: departmentIds },
    isActive: true,
  });

  const placedStudents = await Student.countDocuments({
    department: { $in: departmentIds },
    hasPlacement: true,
    placementApproved: true,
    isActive: true,
  });

  const totalSupervisors = await Supervisor.countDocuments({
    department: { $in: departmentIds },
    isActive: true,
  });

  return {
    faculty,
    statistics: {
      totalDepartments: faculty.departments.length,
      totalStudents,
      placedStudents,
      placementRate:
        totalStudents > 0
          ? ((placedStudents / totalStudents) * 100).toFixed(2)
          : 0,
      totalSupervisors,
    },
  };
};

/**
 * Get institutional overview
 */
const getInstitutionalOverview = async () => {
  const totalFaculties = await Faculty.countDocuments({ isActive: true });
  const totalDepartments = await Department.countDocuments({ isActive: true });
  const totalStudents = await Student.countDocuments({ isActive: true });
  const placedStudents = await Student.countDocuments({
    hasPlacement: true,
    placementApproved: true,
    isActive: true,
  });
  const totalSupervisors = await Supervisor.countDocuments({ isActive: true });
  const pendingPlacements = await Placement.countDocuments({
    status: PLACEMENT_STATUS.PENDING,
  });
  const approvedPlacements = await Placement.countDocuments({
    status: PLACEMENT_STATUS.APPROVED,
  });
  const completedAssessments = await Assessment.countDocuments({
    status: ASSESSMENT_STATUS.COMPLETED,
  });

  // Get placement trends
  const placementsByMonth = await Placement.aggregate([
    {
      $match: { status: PLACEMENT_STATUS.APPROVED },
    },
    {
      $group: {
        _id: {
          year: { $year: "$approvedAt" },
          month: { $month: "$approvedAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 },
    },
    {
      $limit: 12,
    },
  ]);

  return {
    overview: {
      totalFaculties,
      totalDepartments,
      totalStudents,
      placedStudents,
      unplacedStudents: totalStudents - placedStudents,
      placementRate:
        totalStudents > 0
          ? ((placedStudents / totalStudents) * 100).toFixed(2)
          : 0,
      totalSupervisors,
      pendingPlacements,
      approvedPlacements,
      completedAssessments,
    },
    trends: {
      placementsByMonth,
    },
  };
};

/**
 * Get student progress report
 */
const getStudentProgressReport = async (studentId) => {
  const student = await Student.findById(studentId)
    .populate("currentPlacement")
    .populate("departmentalSupervisor")
    .populate("industrialSupervisor");

  if (!student) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
  }

  const logbooks = await Logbook.find({ student: studentId }).sort({
    weekNumber: 1,
  });
  const assessments = await Assessment.find({ student: studentId });

  const logbookStats = {
    total: logbooks.length,
    submitted: logbooks.filter((l) => l.status !== "draft").length,
    approved: logbooks.filter((l) => l.status === "approved").length,
    rejected: logbooks.filter((l) => l.status === "rejected").length,
  };

  const assessmentStats = {
    total: assessments.length,
    pending: assessments.filter((a) => a.status === "pending").length,
    submitted: assessments.filter((a) => a.status === "submitted").length,
    completed: assessments.filter((a) => a.status === "completed").length,
  };

  const departmentalAssessment = assessments.find(
    (a) => a.type === "departmental" && a.status === "completed"
  );
  const industrialAssessment = assessments.find(
    (a) => a.type === "industrial" && a.status === "completed"
  );

  let finalGrade = null;
  if (departmentalAssessment && industrialAssessment) {
    finalGrade =
      departmentalAssessment.calculateFinalGrade(industrialAssessment);
  }

  return {
    student,
    trainingProgress: student.getTrainingProgress(),
    logbookStats,
    assessmentStats,
    logbooks,
    assessments,
    finalGrade,
  };
};

/**
 * Get supervisor performance report
 */
const getSupervisorPerformanceReport = async (supervisorId) => {
  const supervisor = await Supervisor.findById(supervisorId).populate(
    "assignedStudents"
  );

  if (!supervisor) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
  }

  const studentIds = supervisor.assignedStudents.map((s) => s._id);

  const totalLogbooks = await Logbook.countDocuments({
    student: { $in: studentIds },
  });

  const reviewedLogbooks = await Logbook.countDocuments({
    student: { $in: studentIds },
    [`reviews.${supervisor.type}Supervisor`]: { $exists: true },
  });

  const totalAssessments = await Assessment.countDocuments({
    supervisor: supervisorId,
  });

  const completedAssessments = await Assessment.countDocuments({
    supervisor: supervisorId,
    status: ASSESSMENT_STATUS.COMPLETED,
  });

  const avgResponseTime = await Logbook.aggregate([
    {
      $match: {
        student: { $in: studentIds },
        [`reviews.${supervisor.type}Supervisor`]: { $exists: true },
      },
    },
    {
      $project: {
        responseTime: {
          $subtract: [
            `$reviews.${supervisor.type}Supervisor.reviewedAt`,
            "$submittedAt",
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgTime: { $avg: "$responseTime" },
      },
    },
  ]);

  const averageResponseDays =
    avgResponseTime.length > 0
      ? (avgResponseTime[0].avgTime / (1000 * 60 * 60 * 24)).toFixed(1)
      : 0;

  return {
    supervisor,
    statistics: {
      assignedStudents: supervisor.assignedStudents.length,
      maxCapacity: supervisor.maxStudents,
      utilizationRate: (
        (supervisor.assignedStudents.length / supervisor.maxStudents) *
        100
      ).toFixed(2),
      totalLogbooks,
      reviewedLogbooks,
      logbookReviewRate:
        totalLogbooks > 0
          ? ((reviewedLogbooks / totalLogbooks) * 100).toFixed(2)
          : 0,
      totalAssessments,
      completedAssessments,
      assessmentCompletionRate:
        totalAssessments > 0
          ? ((completedAssessments / totalAssessments) * 100).toFixed(2)
          : 0,
      averageResponseDays,
    },
  };
};

/**
 * Get placement report
 */
const getPlacementReport = async (filters = {}) => {
  const query = {};

  if (filters.department) query.department = filters.department;
  if (filters.status) query.status = filters.status;
  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  // If department filter, find students in that department
  if (filters.department) {
    const students = await Student.find({
      department: filters.department,
    }).select("_id");
    query.student = { $in: students.map((s) => s._id) };
    delete query.department;
  }

  const placements = await Placement.find(query)
    .populate({
      path: "student",
      populate: { path: "user" },
    })
    .sort({ createdAt: -1 });

  const statistics = {
    total: placements.length,
    pending: placements.filter((p) => p.status === PLACEMENT_STATUS.PENDING)
      .length,
    approved: placements.filter((p) => p.status === PLACEMENT_STATUS.APPROVED)
      .length,
    rejected: placements.filter((p) => p.status === PLACEMENT_STATUS.REJECTED)
      .length,
    withdrawn: placements.filter((p) => p.status === PLACEMENT_STATUS.WITHDRAWN)
      .length,
  };

  // Company distribution
  const companyDistribution = {};
  placements.forEach((p) => {
    if (p.status === PLACEMENT_STATUS.APPROVED) {
      companyDistribution[p.companyName] =
        (companyDistribution[p.companyName] || 0) + 1;
    }
  });

  return {
    placements,
    statistics,
    companyDistribution,
  };
};

/**
 * Export student report data (for PDF generation)
 */
const exportStudentReport = async (studentId) => {
  const report = await getStudentProgressReport(studentId);

  // This would be used by a PDF generation service
  return {
    ...report,
    generatedAt: new Date(),
    reportType: "Student Progress Report",
  };
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
