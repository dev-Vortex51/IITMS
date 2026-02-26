const { getPrismaClient } = require("../config/prisma");
const { handlePrismaError } = require("../utils/prismaErrors");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../utils/constants");

const prisma = getPrismaClient();

/**
 * Create a new faculty
 */
const createFaculty = async (facultyData, creatorUser) => {
  try {
    const { name, code, description } = facultyData;
    const normalizedCode = code ? code.toUpperCase() : code;

    // Check if faculty with same name or code exists (active or inactive)
    const existingFaculty = await prisma.faculty.findFirst({
      where: {
        OR: [{ name }, { code: normalizedCode }],
      },
    });

    if (existingFaculty) {
      if (existingFaculty.isActive) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "Faculty with this name or code already exists",
        );
      }

      if (normalizedCode && normalizedCode !== existingFaculty.code) {
        const codeConflict = await prisma.faculty.findUnique({
          where: { code: normalizedCode },
          select: { id: true },
        });

        if (codeConflict && codeConflict.id !== existingFaculty.id) {
          throw new ApiError(
            HTTP_STATUS.CONFLICT,
            "Faculty with this code already exists",
          );
        }
      }

      if (name !== existingFaculty.name) {
        const nameConflict = await prisma.faculty.findUnique({
          where: { name },
          select: { id: true },
        });

        if (nameConflict && nameConflict.id !== existingFaculty.id) {
          throw new ApiError(
            HTTP_STATUS.CONFLICT,
            "Faculty with this name already exists",
          );
        }
      }

      const reactivatedFaculty = await prisma.faculty.update({
        where: { id: existingFaculty.id },
        data: {
          name,
          code: normalizedCode,
          description,
          isActive: true,
          updatedAt: new Date(),
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return reactivatedFaculty;
    }

    // Create faculty
    const faculty = await prisma.faculty.create({
      data: {
        name,
        code: normalizedCode,
        description,
        createdBy: { connect: { id: creatorUser.id } },
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return faculty;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Get list of faculties with filtering and pagination
 */
const getFaculties = async (filters = {}, pagination = {}, user = null) => {
  try {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    // Coordinator access control - only see their own faculty
    if (user && user.role === USER_ROLES.COORDINATOR && user.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: user.departmentId },
        include: { faculty: true },
      });

      if (department && department.faculty) {
        where.id = department.faculty.id;
      } else {
        // If coordinator has no department or faculty, return empty result
        return {
          faculties: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: page,
        };
      }
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === "true" || filters.isActive === true;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { code: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Get faculties
    const faculties = await prisma.faculty.findMany({
      where,
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            departments: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    });

    // Add departmentCount field
    const facultiesWithCount = faculties.map((faculty) => ({
      ...faculty,
      departmentCount: faculty._count.departments,
    }));

    const totalCount = await prisma.faculty.count({ where });

    return {
      faculties: facultiesWithCount,
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
 * Get faculty by ID
 */
const getFacultyById = async (facultyId, user = null) => {
  try {
    // Coordinator access control - only access their own faculty
    if (user && user.role === USER_ROLES.COORDINATOR && user.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: user.departmentId },
        include: { faculty: true },
      });

      if (
        !department ||
        !department.faculty ||
        department.faculty.id !== facultyId
      ) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "Access denied. You can only view your own faculty.",
        );
      }
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            departments: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!faculty) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found");
    }

    return {
      ...faculty,
      departmentCount: faculty._count.departments,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Update faculty information
 */
const updateFaculty = async (facultyId, updateData) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found");
    }

    // Check for duplicate name/code if being updated
    if (updateData.name || updateData.code) {
      const where = {
        id: { not: facultyId },
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
        const existingFaculty = await prisma.faculty.findFirst({
          where: {
            AND: [where, { OR: duplicateFilters }],
          },
        });

        if (existingFaculty) {
          throw new ApiError(
            HTTP_STATUS.CONFLICT,
            "Faculty with this name or code already exists",
          );
        }
      }
    }

    // Update faculty
    const updatedFaculty = await prisma.faculty.update({
      where: { id: facultyId },
      data: {
        name: updateData.name,
        description: updateData.description,
        code: updateData.code ? updateData.code.toUpperCase() : faculty.code,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedFaculty;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const prismaError = handlePrismaError(error);
    throw prismaError;
  }
};

/**
 * Delete (deactivate) faculty
 */
const deleteFaculty = async (facultyId) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found");
    }

    // Check if faculty has active departments
    const activeDepartments = await prisma.department.count({
      where: {
        facultyId,
        isActive: true,
      },
    });

    if (activeDepartments > 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot delete faculty with active departments. Please delete or deactivate all departments first.",
      );
    }

    // Soft delete
    await prisma.faculty.update({
      where: { id: facultyId },
      data: {
        isActive: false,
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
 * Get all departments of a faculty
 */
const getFacultyDepartments = async (facultyId) => {
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
          select: {
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
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

module.exports = {
  createFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  getFacultyDepartments,
};
