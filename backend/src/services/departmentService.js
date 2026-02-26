const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../utils/constants");
const logger = require("../utils/logger");

const prisma = getPrismaClient();

/**
 * Create a new department
 */
const createDepartment = async (departmentData, creatorUser) => {
  try {
    const { name, code, faculty, description } = departmentData;

    // Verify faculty exists
    const facultyDoc = await prisma.faculty.findUnique({
      where: { id: faculty },
    });
    if (!facultyDoc || !facultyDoc.isActive) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Faculty not found or inactive",
      );
    }

    // Check if department with same name or code exists within the faculty
    const existingDepartment = await prisma.department.findFirst({
      where: {
        OR: [
          { name, facultyId: faculty },
          { code: code.toUpperCase(), facultyId: faculty },
        ],
        isActive: true,
      },
    });

    if (existingDepartment) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Department with this name or code already exists in the faculty",
      );
    }

    // Create department
    const department = await prisma.department.create({
      data: {
        name,
        code: code.toUpperCase(),
        facultyId: faculty,
        description,
        createdById: creatorUser.id,
      },
      include: {
        faculty: {
          select: { name: true, code: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return department;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Get list of departments with filtering and pagination
 */
const getDepartments = async (filters = {}, pagination = {}, user = null) => {
  try {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    // Coordinator access control - only see their own department
    if (user && user.role === USER_ROLES.COORDINATOR && user.departmentId) {
      where.id = user.departmentId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === "true" || filters.isActive === true;
    } else {
      // Default to active departments only
      where.isActive = true;
    }

    if (filters.faculty) {
      where.facultyId = filters.faculty;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { code: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Get departments with counts
    const departments = await prisma.department.findMany({
      where,
      include: {
        faculty: {
          select: { name: true, code: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
        coordinators: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: {
            students: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: [{ faculty: { name: "asc" } }, { name: "asc" }],
      skip,
      take: Number(limit),
    });

    // Add studentCount field
    const departmentsWithCount = departments.map((dept) => ({
      ...dept,
      studentCount: dept._count.students,
    }));

    const totalCount = await prisma.department.count({ where });

    return {
      departments: departmentsWithCount,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Get department by ID
 */
const getDepartmentById = async (departmentId, user = null) => {
  try {
    // Coordinator access control - only access their own department
    if (user && user.role === USER_ROLES.COORDINATOR && user.departmentId) {
      if (user.departmentId !== departmentId) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "Access denied. You can only view your own department.",
        );
      }
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        faculty: {
          select: { name: true, code: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
        coordinators: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        _count: {
          select: {
            students: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    return {
      ...department,
      studentCount: department._count.students,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Update department information
 */
const updateDepartment = async (departmentId, updateData, updaterUser) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    // Verify faculty exists if being updated
    if (updateData.faculty) {
      const facultyDoc = await prisma.faculty.findUnique({
        where: { id: updateData.faculty },
      });
      if (!facultyDoc || !facultyDoc.isActive) {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          "Faculty not found or inactive",
        );
      }
    }

    // Check for duplicate name/code if being updated
    if (updateData.name || updateData.code || updateData.faculty) {
      const where = {
        id: { not: departmentId },
        facultyId: updateData.faculty || department.facultyId,
        isActive: true,
      };

      const duplicateFilters = [];

      if (updateData.name) {
        duplicateFilters.push({ name: updateData.name });
      }
      if (updateData.code) {
        duplicateFilters.push({
          code: updateData.code.toUpperCase(),
        });
      }

      if (duplicateFilters.length > 0) {
        const existingDepartment = await prisma.department.findFirst({
          where: {
            AND: [where, { OR: duplicateFilters }],
          },
        });

        if (existingDepartment) {
          throw new ApiError(
            HTTP_STATUS.CONFLICT,
            "Department with this name or code already exists in the faculty",
          );
        }
      }
    }

    // Update department
    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: {
        name: updateData.name,
        description: updateData.description,
        code: updateData.code ? updateData.code.toUpperCase() : department.code,
        facultyId: updateData.faculty,
        updatedAt: new Date(),
      },
      include: {
        faculty: {
          select: { name: true, code: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return updatedDepartment;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Delete (deactivate) department
 */
const deleteDepartment = async (departmentId) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    // Check if department has active students
    const activeStudents = await prisma.student.count({
      where: {
        departmentId,
        isActive: true,
      },
    });

    if (activeStudents > 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot delete department with active students. Please transfer or deactivate all students first.",
      );
    }

    // Soft delete
    const archivedCode = `${department.code}__deleted__${Date.now()}`;
    await prisma.department.update({
      where: { id: departmentId },
      data: {
        isActive: false,
        code: archivedCode,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Toggle department status (activate/deactivate)
 */
const toggleDepartmentStatus = async (departmentId, user) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        faculty: { select: { name: true, code: true } },
      },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    const newStatus = !department.isActive;

    // If activating, restore original code if it was archived
    let updateData = {
      isActive: newStatus,
      updatedAt: new Date(),
    };

    if (newStatus && department.code.includes("__deleted__")) {
      // Extract original code before __deleted__ suffix
      const originalCode = department.code.split("__deleted__")[0];
      updateData.code = originalCode;
    } else if (!newStatus) {
      // Deactivating - check for active students
      const activeStudents = await prisma.student.count({
        where: { departmentId, isActive: true },
      });

      if (activeStudents > 0) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Cannot deactivate department with active students.",
        );
      }

      // Archive the code
      const archivedCode = `${department.code}__deleted__${Date.now()}`;
      updateData.code = archivedCode;
    }

    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: updateData,
      include: {
        faculty: { select: { name: true, code: true } },
        createdBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return updatedDepartment;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Hard delete department (permanent deletion)
 * Only allowed for inactive departments
 */
const hardDeleteDepartment = async (departmentId, user) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    // Only allow hard delete for inactive departments
    if (department.isActive) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot permanently delete an active department. Deactivate it first.",
      );
    }

    // Check if department has any students (active or inactive)
    const studentCount = await prisma.student.count({
      where: { departmentId },
    });

    if (studentCount > 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot permanently delete department with associated students. Please transfer all students first.",
      );
    }

    // Hard delete
    await prisma.department.delete({
      where: { id: departmentId },
    });

    logger.info(
      `Department ${department.name} (${department.code}) permanently deleted by user ${user.email}`,
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Get all departments of a faculty
 */
const getDepartmentsByFaculty = async (facultyId) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found");
    }

    const departments = await prisma.department.findMany({
      where: {
        facultyId,
        isActive: true,
      },
      include: {
        faculty: {
          select: { name: true, code: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return departments;
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Get department statistics including student counts
 */
const getDepartmentStats = async (departmentId) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    const [totalStudents, activeStudents] = await Promise.all([
      prisma.student.count({
        where: { departmentId },
      }),
      prisma.student.count({
        where: {
          departmentId,
          isActive: true,
        },
      }),
    ]);

    return {
      totalStudents,
      activeStudents,
      inactiveStudents: totalStudents - activeStudents,
    };
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Assign coordinator to department
 */
const assignCoordinator = async (departmentId, coordinatorId) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }

    // Verify the coordinator user exists and has coordinator role
    const coordinator = await prisma.user.findUnique({
      where: { id: coordinatorId },
    });
    if (!coordinator) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Coordinator not found");
    }

    if (coordinator.role !== USER_ROLES.COORDINATOR) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "User is not a coordinator");
    }

    if (coordinator.departmentId) {
      if (coordinator.departmentId !== departmentId) {
        // Get department names for better error message
        const coordinatorDept = await prisma.department.findUnique({
          where: { id: coordinator.departmentId },
          select: { name: true },
        });
        const targetDept = await prisma.department.findUnique({
          where: { id: departmentId },
          select: { name: true },
        });

        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Coordinator ${coordinator.firstName} ${
            coordinator.lastName
          } belongs to ${
            coordinatorDept?.name || "another department"
          } and cannot be assigned to ${
            targetDept?.name || "this department"
          }. Coordinators can only be assigned to their own department.`,
        );
      }
    } else {
      // If coordinator doesn't have a department yet, assign them to this one
      await prisma.user.update({
        where: { id: coordinatorId },
        data: {
          department: { connect: { id: departmentId } },
          faculty: { connect: { id: department.facultyId } },
        },
      });
    }

    // Update coordinator's department assignment and faculty
    await prisma.user.update({
      where: { id: coordinatorId },
      data: {
        department: { connect: { id: departmentId } },
        faculty: { connect: { id: department.facultyId } },
      },
    });

    // Update department coordinator assignment
    await prisma.department.update({
      where: { id: departmentId },
      data: {
        coordinators: { connect: { id: coordinatorId } },
        updatedAt: new Date(),
      },
    });

    // Return updated department with coordinator info
    const updatedDepartment = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        faculty: {
          select: { name: true, code: true },
        },
        coordinators: {
          select: { firstName: true, lastName: true, email: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return updatedDepartment;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Get available coordinators for assignment to a department
 */
const getCoordinatorsForDepartment = async (departmentId) => {
  try {
    const coordinators = await prisma.user.findMany({
      where: {
        role: USER_ROLES.COORDINATOR,
        isActive: true,
        OR: [
          { departmentId: null }, // Unassigned coordinators
          { departmentId }, // Coordinators already in this department
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        departmentId: true,
        faculty: {
          select: { name: true },
        },
        department: {
          select: { name: true },
        },
      },
    });

    return coordinators;
  } catch (error) {
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
  hardDeleteDepartment,
  getDepartmentsByFaculty,
  getDepartmentStats,
  assignCoordinator,
  getCoordinatorsForDepartment,
};
