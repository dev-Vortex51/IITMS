/**
 * Faculty Service
 * Business logic for faculty management
 */

const { Faculty, Department, User } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../utils/constants");

/**
 * Create a new faculty
 * @param {Object} facultyData - Faculty creation data
 * @param {Object} creatorUser - User creating the faculty
 * @returns {Promise<Object>} Created faculty
 */
const createFaculty = async (facultyData, creatorUser) => {
  const { name, code, description } = facultyData;

  // Check if faculty with same name or code exists
  const existingFaculty = await Faculty.findOne({
    $or: [{ name }, { code }],
    isActive: true,
  });

  if (existingFaculty) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "Faculty with this name or code already exists"
    );
  }

  // Create faculty
  const faculty = await Faculty.create({
    name,
    code: code.toUpperCase(),
    description,
    createdBy: creatorUser._id,
  });

  return await Faculty.findById(faculty._id).populate(
    "createdBy",
    "firstName lastName email"
  );
};

/**
 * Get all faculties with pagination and filtering
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination options
 * @param {Object} user - Current user for access control
 * @returns {Promise<Object>} Paginated faculties
 */
const getFaculties = async (filters = {}, pagination = {}, user = null) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  // Build query
  const query = {};

  // Coordinator access control - only see their own faculty
  if (user && user.role === USER_ROLES.COORDINATOR && user.department) {
    const Department = require("../models/Department");
    const department = await Department.findById(user.department).populate(
      "faculty"
    );
    if (department && department.faculty) {
      query._id = department.faculty._id;
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
    query.isActive = filters.isActive === "true";
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { code: { $regex: filters.search, $options: "i" } },
    ];
  }

  // Get faculties with department count
  const faculties = await Faculty.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "departments",
        localField: "_id",
        foreignField: "faculty",
        as: "departments",
      },
    },
    {
      $addFields: {
        departmentCount: { $size: "$departments" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: {
        path: "$createdBy",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        departments: 0,
        "createdBy.password": 0,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: parseInt(limit) },
  ]);

  const totalCount = await Faculty.countDocuments(query);

  return {
    faculties,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
};

/**
 * Get faculty by ID
 * @param {string} facultyId - Faculty ID
 * @param {Object} user - Current user for access control
 * @returns {Promise<Object>} Faculty details
 */
const getFacultyById = async (facultyId, user = null) => {
  // Coordinator access control - only access their own faculty
  if (user && user.role === USER_ROLES.COORDINATOR && user.department) {
    const Department = require("../models/Department");
    const department = await Department.findById(user.department).populate(
      "faculty"
    );
    if (
      !department ||
      !department.faculty ||
      department.faculty._id.toString() !== facultyId
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied. You can only view your own faculty."
      );
    }
  }

  const faculty = await Faculty.findById(facultyId)
    .populate("createdBy", "firstName lastName email")
    .lean();

  if (!faculty) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found");
  }

  // Get department count
  const departmentCount = await Department.countDocuments({
    faculty: facultyId,
    isActive: true,
  });

  return {
    ...faculty,
    departmentCount,
  };
};

/**
 * Update faculty
 * @param {string} facultyId - Faculty ID
 * @param {Object} updateData - Update data
 * @param {Object} updaterUser - User updating the faculty
 * @returns {Promise<Object>} Updated faculty
 */
const updateFaculty = async (facultyId, updateData, updaterUser) => {
  const faculty = await Faculty.findById(facultyId);

  if (!faculty) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found");
  }

  // Check for duplicate name/code if being updated
  if (updateData.name || updateData.code) {
    const duplicateQuery = {
      _id: { $ne: facultyId },
      isActive: true,
    };

    if (updateData.name && updateData.code) {
      duplicateQuery.$or = [
        { name: updateData.name },
        { code: updateData.code.toUpperCase() },
      ];
    } else if (updateData.name) {
      duplicateQuery.name = updateData.name;
    } else if (updateData.code) {
      duplicateQuery.code = updateData.code.toUpperCase();
    }

    const existingFaculty = await Faculty.findOne(duplicateQuery);
    if (existingFaculty) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Faculty with this name or code already exists"
      );
    }
  }

  // Update faculty
  const updatedFaculty = await Faculty.findByIdAndUpdate(
    facultyId,
    {
      ...updateData,
      code: updateData.code ? updateData.code.toUpperCase() : faculty.code,
      updatedAt: new Date(),
    },
    { new: true, runValidators: true }
  ).populate("createdBy", "firstName lastName email");

  return updatedFaculty;
};

/**
 * Delete (deactivate) faculty
 * @param {string} facultyId - Faculty ID
 * @param {Object} deleterUser - User deleting the faculty
 * @returns {Promise<void>}
 */
const deleteFaculty = async (facultyId, deleterUser) => {
  const faculty = await Faculty.findById(facultyId);

  if (!faculty) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found");
  }

  // Check if faculty has active departments
  const activeDepartments = await Department.countDocuments({
    faculty: facultyId,
    isActive: true,
  });

  if (activeDepartments > 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Cannot delete faculty with active departments. Please delete or deactivate all departments first."
    );
  }

  // Soft delete
  await Faculty.findByIdAndUpdate(facultyId, {
    isActive: false,
    updatedAt: new Date(),
  });
};

/**
 * Get all departments in a faculty
 * @param {string} facultyId - Faculty ID
 * @returns {Promise<Array>} Faculty departments
 */
const getFacultyDepartments = async (facultyId) => {
  const faculty = await Faculty.findById(facultyId);

  if (!faculty) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found");
  }

  const departments = await Department.find({
    faculty: facultyId,
    isActive: true,
  })
    .populate("faculty", "name code")
    .populate("createdBy", "firstName lastName email")
    .sort({ name: 1 });

  return departments;
};

module.exports = {
  createFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  getFacultyDepartments,
};
