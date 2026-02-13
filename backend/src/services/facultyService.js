const { Faculty, Department, User } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../utils/constants");

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
      "Faculty with this name or code already exists",
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
    "firstName lastName email",
  );
};

const getFaculties = async (filters = {}, pagination = {}, user = null) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  // Build query
  const query = {};

  // Coordinator access control - only see their own faculty
  if (user && user.role === USER_ROLES.COORDINATOR && user.department) {
    const Department = require("../models/Department");
    const department = await Department.findById(user.department).populate(
      "faculty",
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

  // Get faculties with department count - optimized with lean and select
  const faculties = await Faculty.find(query)
    .select("-__v")
    .populate("createdBy", "firstName lastName email -_id")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get department counts separately (more efficient than aggregation)
  const Department = require("../models/Department");
  const facultyIds = faculties.map((f) => f._id);
  const departmentCounts = await Department.aggregate([
    { $match: { faculty: { $in: facultyIds }, isActive: true } },
    { $group: { _id: "$faculty", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(
    departmentCounts.map((dc) => [dc._id.toString(), dc.count]),
  );

  // Add department counts to faculties
  faculties.forEach((faculty) => {
    faculty.departmentCount = countMap.get(faculty._id.toString()) || 0;
  });

  const totalCount = await Faculty.countDocuments(query);

  return {
    faculties,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
};

const getFacultyById = async (facultyId, user = null) => {
  // Coordinator access control - only access their own faculty
  if (user && user.role === USER_ROLES.COORDINATOR && user.department) {
    const Department = require("../models/Department");
    const department = await Department.findById(user.department).populate(
      "faculty",
    );
    if (
      !department ||
      !department.faculty ||
      department.faculty._id.toString() !== facultyId
    ) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied. You can only view your own faculty.",
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
        "Faculty with this name or code already exists",
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
    { new: true, runValidators: true },
  ).populate("createdBy", "firstName lastName email");

  return updatedFaculty;
};

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
      "Cannot delete faculty with active departments. Please delete or deactivate all departments first.",
    );
  }

  // Soft delete
  await Faculty.findByIdAndUpdate(facultyId, {
    isActive: false,
    updatedAt: new Date(),
  });
};

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
