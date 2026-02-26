const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  SUPERVISOR_TYPES,
  USER_ROLES,
} = require("../utils/constants");
const { parsePagination, buildPaginationMeta } = require("../utils/helpers");
const logger = require("../utils/logger");

const prisma = getPrismaClient();

/**
 * Get all supervisors with filters
 */
const getSupervisors = async (filters = {}, pagination = {}) => {
  try {
    const { page, limit, skip } = parsePagination(pagination);
    let where = { isActive: true };

    // Handle type filter
    if (filters.type) {
      if (filters.type === "departmental" || filters.type === "academic") {
        where.type = { in: ["academic", "departmental"] };
      } else {
        where.type = filters.type;
      }
    }

    // Handle company filter for industrial supervisors
    if (filters.companyName && filters.type === "industrial") {
      where.companyName = { equals: filters.companyName, mode: "insensitive" };
    }

    // Handle department filter
    if (filters.department) {
      where.departmentId = filters.department;
    } else if (filters.coordinatorDepartment && !filters.type) {
      where.OR = [
        { type: "academic" },
        { type: "departmental" },
        { type: "academic", departmentId: null },
        { type: "departmental", departmentId: null },
        { type: "industrial" },
      ];
    }

    // Handle availability filter
    if (filters.available !== undefined) {
      const allSupervisors = await prisma.supervisor.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          department: {
            select: { name: true, code: true },
          },
          assignedStudents: true,
        },
      });

      const availableSupervisors = allSupervisors.filter((s) => {
        const isAvailable = s.assignedStudents.length < s.maxStudents;
        return isAvailable === filters.available;
      });

      return {
        supervisors: availableSupervisors
          .slice(skip, skip + limit)
          .map(transformSupervisor),
        pagination: buildPaginationMeta(
          availableSupervisors.length,
          page,
          limit,
        ),
      };
    }

    const supervisors = await prisma.supervisor.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        department: {
          select: { name: true, code: true },
        },
        assignedStudents: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.supervisor.count({ where });

    return {
      supervisors: supervisors.map(transformSupervisor),
      pagination: buildPaginationMeta(total, page, limit),
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Transform supervisor to include user fields at top level
 */
const transformSupervisor = (supervisor) => {
  if (!supervisor.user || !supervisor.user.firstName) {
    logger.error(
      `[supervisorService] Supervisor with missing/incomplete user data: ${supervisor.id}`,
    );
  }

  return {
    ...supervisor,
    name:
      supervisor.user && supervisor.user.firstName && supervisor.user.lastName
        ? `${supervisor.user.firstName} ${supervisor.user.lastName}`
        : "Unknown",
    email: supervisor.user?.email || null,
    phone: supervisor.user?.phone || null,
    students: supervisor.assignedStudents || [],
    isAvailable: supervisor.assignedStudents.length < supervisor.maxStudents,
  };
};

/**
 * Get supervisor by ID
 */
const getSupervisorById = async (supervisorId) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        department: {
          select: { name: true, code: true },
        },
        assignedStudents: {
          include: {
            student: {
              select: {
                id: true,
                matricNumber: true,
                level: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    // Transform assignedStudents to include student data
    const transformedSupervisor = transformSupervisor(supervisor);

    // Map supervisor assignments to student objects with student details
    transformedSupervisor.students = supervisor.assignedStudents.map(
      (assignment) => ({
        id: assignment.student.id,
        matricNumber: assignment.student.matricNumber,
        level: assignment.student.level,
        name: `${assignment.student.user.firstName} ${assignment.student.user.lastName}`,
        email: assignment.student.user.email,
        assignmentId: assignment.id,
        assignmentStatus: assignment.status,
      }),
    );

    return transformedSupervisor;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Update supervisor profile
 */
const updateSupervisor = async (supervisorId, updateData) => {
  try {
    const allowedFields = [
      "specialization",
      "maxStudents",
      "isActive",
      "companyName",
      "companyAddress",
      "department",
    ];
    const filteredData = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === "department") {
          filteredData.departmentId = updateData[field];
        } else {
          filteredData[field] = updateData[field];
        }
      }
    });

    const supervisor = await prisma.supervisor.update({
      where: { id: supervisorId },
      data: filteredData,
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    logger.info(`Supervisor updated: ${supervisorId}`);

    return supervisor;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Get available supervisors for assignment
 */
const getAvailableSupervisors = async (type, departmentId = null) => {
  try {
    const where = { isActive: true };

    if (type === "departmental" || type === "academic") {
      where.type = { in: ["academic", "departmental"] };
    } else {
      where.type = type;
    }

    if (departmentId) {
      where.OR = [{ departmentId }, { departmentId: null }];
    }

    const supervisors = await prisma.supervisor.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        department: {
          select: { name: true, code: true },
        },
        assignedStudents: true,
      },
    });

    // Filter by availability
    const available = supervisors.filter(
      (s) => s.assignedStudents.length < s.maxStudents,
    );

    return available.map(transformSupervisor);
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Assign student to supervisor
 */
const assignStudentToSupervisor = async (supervisorId, studentId) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: { assignedStudents: true },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    const isAvailable =
      supervisor.assignedStudents.length < supervisor.maxStudents;
    if (!isAvailable) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Supervisor has reached maximum student capacity",
      );
    }

    // Create supervisor assignment
    await prisma.supervisorAssignment.upsert({
      where: {
        supervisorId_studentId: { supervisorId, studentId },
      },
      update: {},
      create: { supervisorId, studentId },
    });

    logger.info(`Student ${studentId} assigned to supervisor ${supervisorId}`);

    return supervisor;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Unassign student from supervisor
 */
const unassignStudentFromSupervisor = async (supervisorId, studentId) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    // Delete supervisor assignment
    await prisma.supervisorAssignment.deleteMany({
      where: { supervisorId, studentId },
    });

    // Update student record
    if (supervisor.type === "academic" || supervisor.type === "departmental") {
      await prisma.student.update({
        where: { id: studentId },
        data: { academicSupervisorId: null },
      });
    } else {
      await prisma.student.update({
        where: { id: studentId },
        data: { industrialSupervisorId: null },
      });
    }

    logger.info(
      `Student ${studentId} unassigned from supervisor ${supervisorId}`,
    );

    return supervisor;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Get supervisor dashboard data
 */
const getSupervisorDashboard = async (supervisorId) => {
  try {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      include: {
        assignedStudents: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
            placements: {
              select: { companyName: true, status: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!supervisor) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
    }

    const studentIds = supervisor.assignedStudents.map((s) => s.id);

    // Get pending logbooks based on supervisor type
    const logbookWhere = { studentId: { in: studentIds }, status: "submitted" };
    if (supervisor.type === "academic" || supervisor.type === "departmental") {
      logbookWhere.academicReview = { is: null };
    } else {
      logbookWhere.industrialReview = { is: null };
    }

    const pendingLogbooks = await prisma.logbook.findMany({
      where: logbookWhere,
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Get pending assessments
    const assessmentWhere = {
      studentId: { in: studentIds },
      status: "pending",
      assessorId: supervisorId,
    };

    const pendingAssessments = await prisma.assessment.findMany({
      where: assessmentWhere,
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Get total logbook count
    const totalLogbooks = await prisma.logbook.count({
      where: { studentId: { in: studentIds } },
    });

    return {
      supervisor,
      statistics: {
        assignedStudents: supervisor.assignedStudents.length,
        maxCapacity: supervisor.maxStudents,
        pendingLogbooks: pendingLogbooks.length,
        pendingAssessments: pendingAssessments.length,
        totalLogbooks,
      },
      pendingLogbooks,
      pendingAssessments,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Get supervisors by department
 */
const getSupervisorsByDepartment = async (departmentId, type = null) => {
  try {
    const where = { departmentId, isActive: true };

    if (type) {
      where.type = type;
    }

    const supervisors = await prisma.supervisor.findMany({ where });

    return supervisors;
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Suggest supervisors for a student
 */
const suggestSupervisors = async (studentId, type, user) => {
  try {
    if (!studentId || !type) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Student ID and type are required",
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        department: {
          include: { faculty: { select: { name: true, code: true } } },
        },
        placements: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!student) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
    }

    // Coordinators can only fetch suggestions for their department's students
    if (
      user &&
      user.role === USER_ROLES.COORDINATOR &&
      user.departmentId &&
      student.departmentId !== user.departmentId
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only fetch suggestions for students in your department",
      );
    }

    const studentFacultyId = student.department?.facultyId;

    // Academic / departmental suggestions
    if (type === "academic" || type === "departmental") {
      const supervisors = await prisma.supervisor.findMany({
        where: {
          isActive: true,
          type: { in: ["academic", "departmental"] },
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          department: {
            include: { faculty: { select: { name: true, code: true } } },
          },
          assignedStudents: true,
        },
      });

      const filtered = supervisors
        .filter((sup) => sup.assignedStudents.length < sup.maxStudents)
        .filter((sup) => {
          if (!studentFacultyId) return true;
          if (!sup.departmentId) return true; // cross-department
          return sup.department.facultyId === studentFacultyId;
        })
        .map((sup) => {
          const assignedCount = sup.assignedStudents.length;
          const remaining = sup.maxStudents - assignedCount;
          const facultyMatched = sup.department?.facultyId === studentFacultyId;
          return {
            ...sup,
            name:
              sup.user && sup.user.firstName && sup.user.lastName
                ? `${sup.user.firstName} ${sup.user.lastName}`
                : "Unknown",
            email: sup.user?.email || null,
            phone: sup.user?.phone || null,
            suggestionReason: facultyMatched
              ? "Same faculty"
              : "Cross-department (no department set)",
            score: remaining + (facultyMatched ? 2 : 0),
          };
        })
        .sort((a, b) => b.score - a.score);

      return filtered;
    }

    // Industrial suggestions
    if (type === "industrial") {
      let placement =
        student.placements && student.placements.length > 0
          ? student.placements[0]
          : null;
      if (!placement && studentId) {
        placement = await prisma.placement.findFirst({
          where: { studentId },
          orderBy: { createdAt: "desc" },
        });
      }

      const companyName = placement?.companyName;

      const supervisors = await prisma.supervisor.findMany({
        where: {
          isActive: true,
          type: "industrial",
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          assignedStudents: true,
        },
      });

      const matches = supervisors
        .map((sup) => {
          const assignedCount = sup.assignedStudents.length;
          const remaining = sup.maxStudents - assignedCount;
          const companyMatched =
            companyName && sup.companyName
              ? sup.companyName.toLowerCase() === companyName.toLowerCase()
              : false;
          return {
            ...sup,
            name:
              sup.user && sup.user.firstName && sup.user.lastName
                ? `${sup.user.firstName} ${sup.user.lastName}`
                : "Unknown",
            email: sup.user?.email || null,
            phone: sup.user?.phone || null,
            suggestionReason: companyMatched
              ? `Existing supervisor for ${companyName}`
              : "Available industrial supervisor",
            score: remaining + (companyMatched ? 3 : 0),
            companyMatched,
          };
        })
        .filter((sup) => {
          if (companyName) {
            return sup.companyMatched && sup.score > 0;
          }
          return sup.score > 0;
        })
        .sort((a, b) => b.score - a.score);

      return matches;
    }

    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Unsupported supervisor type");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = {
  getSupervisors,
  getSupervisorById,
  updateSupervisor,
  getAvailableSupervisors,
  suggestSupervisors,
  assignStudentToSupervisor,
  unassignStudentFromSupervisor,
  getSupervisorDashboard,
  getSupervisorsByDepartment,
};
