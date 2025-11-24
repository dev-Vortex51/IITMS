/**
 * Department Service
 * Business logic for department management
 */

const { Department, Faculty, User, Student } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../utils/constants");
const mongoose = require("mongoose");

/**
 * Create a new department
 * @param {Object} departmentData - Department creation data
 * @param {Object} creatorUser - User creating the department
 * @returns {Promise<Object>} Created department
 */
const createDepartment = async (departmentData, creatorUser) => {
  const { name, code, faculty, description } = departmentData;

  // Verify faculty exists
  const facultyDoc = await Faculty.findById(faculty);
  if (!facultyDoc || !facultyDoc.isActive) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found or inactive");
  }

  // Check if department with same name or code exists within the faculty
  const existingDepartment = await Department.findOne({
    $or: [
      { name, faculty },
      { code: code.toUpperCase(), faculty },
    ],
    isActive: true,
  });

  if (existingDepartment) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "Department with this name or code already exists in the faculty"
    );
  }

  // Create department
  const department = await Department.create({
    name,
    code: code.toUpperCase(),
    faculty,
    description,
    createdBy: creatorUser._id,
  });

  return await Department.findById(department._id)
    .populate("faculty", "name code")
    .populate("createdBy", "firstName lastName email");
};

/**
 * Get all departments with pagination and filtering
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination options
 * @param {Object} user - Current user for access control
 * @returns {Promise<Object>} Paginated departments
 */
const getDepartments = async (filters = {}, pagination = {}, user = null) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  // Build query
  const query = {};

  // Coordinator access control - only see their own department
  if (user && user.role === USER_ROLES.COORDINATOR && user.department) {
    query._id = user.department;
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === "true";
  } else {
    // Default to active departments only
    query.isActive = true;
  }

  if (filters.faculty) {
    query.faculty = new mongoose.Types.ObjectId(filters.faculty);
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { code: { $regex: filters.search, $options: "i" } },
    ];
  }

  console.log("Department Service - Query:", JSON.stringify(query, null, 2));
  console.log("Department Service - Filters:", filters);
  console.log("Department Service - User role:", user?.role);

  // Debug: Check total students in database
  const totalStudents = await Student.countDocuments();
  console.log("Total students in database:", totalStudents);

  // Debug: Sample student to check structure (lean to get raw data)
  const sampleStudent = await Student.findOne().lean();
  console.log("Sample student (lean):", JSON.stringify(sampleStudent, null, 2));
  console.log(
    "Sample student department type:",
    typeof sampleStudent?.department
  );
  // Get departments with student count
  const departments = await Department.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "students",
        let: { deptId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$department", "$$deptId"] },
                  { $eq: ["$department._id", "$$deptId"] },
                ],
              },
            },
          },
        ],
        as: "students",
      },
    },
    {
      $addFields: {
        studentCount: { $size: "$students" },
      },
    },
    {
      $lookup: {
        from: "faculties",
        localField: "faculty",
        foreignField: "_id",
        as: "faculty",
      },
    },
    {
      $unwind: {
        path: "$faculty",
        preserveNullAndEmptyArrays: true,
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
        students: 0,
        "createdBy.password": 0,
      },
    },
    { $sort: { "faculty.name": 1, name: 1 } },
    { $skip: skip },
    { $limit: parseInt(limit) },
  ]);

  console.log(
    "Aggregation result - First department:",
    JSON.stringify(departments[0], null, 2)
  );
  console.log("Total departments found:", departments.length);

  const totalCount = await Department.countDocuments(query);

  return {
    departments,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
};

/**
 * Get department by ID
 * @param {string} departmentId - Department ID
 * @param {Object} user - Current user for access control
 * @returns {Promise<Object>} Department details
 */
const getDepartmentById = async (departmentId, user = null) => {
  // Coordinator access control - only access their own department
  if (user && user.role === USER_ROLES.COORDINATOR && user.department) {
    if (user.department.toString() !== departmentId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied. You can only view your own department."
      );
    }
  }

  const department = await Department.findById(departmentId)
    .populate("faculty", "name code")
    .populate("createdBy", "firstName lastName email")
    .lean();

  if (!department) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
  }

  // Get student count
  const studentCount = await Student.countDocuments({
    department: departmentId,
    isActive: true,
  });

  return {
    ...department,
    studentCount,
  };
};

/**
 * Update department
 * @param {string} departmentId - Department ID
 * @param {Object} updateData - Update data
 * @param {Object} updaterUser - User updating the department
 * @returns {Promise<Object>} Updated department
 */
const updateDepartment = async (departmentId, updateData, updaterUser) => {
  const department = await Department.findById(departmentId);

  if (!department) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
  }

  // Verify faculty exists if being updated
  if (updateData.faculty) {
    const facultyDoc = await Faculty.findById(updateData.faculty);
    if (!facultyDoc || !facultyDoc.isActive) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Faculty not found or inactive"
      );
    }
  }

  // Check for duplicate name/code if being updated
  if (updateData.name || updateData.code || updateData.faculty) {
    const duplicateQuery = {
      _id: { $ne: departmentId },
      faculty: updateData.faculty || department.faculty,
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

    const existingDepartment = await Department.findOne(duplicateQuery);
    if (existingDepartment) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Department with this name or code already exists in the faculty"
      );
    }
  }

  // Update department
  const updatedDepartment = await Department.findByIdAndUpdate(
    departmentId,
    {
      ...updateData,
      code: updateData.code ? updateData.code.toUpperCase() : department.code,
      updatedAt: new Date(),
    },
    { new: true, runValidators: true }
  )
    .populate("faculty", "name code")
    .populate("createdBy", "firstName lastName email");

  return updatedDepartment;
};

/**
 * Delete (deactivate) department
 * @param {string} departmentId - Department ID
 * @param {Object} deleterUser - User deleting the department
 * @returns {Promise<void>}
 */
const deleteDepartment = async (departmentId, deleterUser) => {
  const department = await Department.findById(departmentId);

  if (!department) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
  }

  // Check if department has active students
  const activeStudents = await Student.countDocuments({
    department: departmentId,
    isActive: true,
  });

  if (activeStudents > 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Cannot delete department with active students. Please transfer or deactivate all students first."
    );
  }

  // Soft delete
  await Department.findByIdAndUpdate(departmentId, {
    isActive: false,
    updatedAt: new Date(),
  });
};

/**
 * Get departments by faculty
 * @param {string} facultyId - Faculty ID
 * @returns {Promise<Array>} Faculty departments
 */
const getDepartmentsByFaculty = async (facultyId) => {
  const faculty = await Faculty.findById(facultyId);

  if (!faculty) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Faculty not found");
  }

  const departments = await Department.find({
    faculty: facultyId,
    isActive: true,
  })
    .populate("faculty", "name code")
    .sort({ name: 1 });

  return departments;
};

/**
 * Get department statistics
 * @param {string} departmentId - Department ID
 * @returns {Promise<Object>} Department statistics
 */
const getDepartmentStats = async (departmentId) => {
  const department = await Department.findById(departmentId);

  if (!department) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
  }

  const [totalStudents, activeStudents] = await Promise.all([
    Student.countDocuments({ department: departmentId }),
    Student.countDocuments({ department: departmentId, isActive: true }),
  ]);

  return {
    totalStudents,
    activeStudents,
    inactiveStudents: totalStudents - activeStudents,
  };
};

/**
 * Assign coordinator to department
 * @param {string} departmentId - Department ID
 * @param {string} coordinatorId - Coordinator user ID
 * @param {Object} assignerUser - User assigning the coordinator
 * @returns {Promise<Object>} Updated department
 */
const assignCoordinator = async (departmentId, coordinatorId, assignerUser) => {
  const department = await Department.findById(departmentId);

  if (!department) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
  }

  // Verify the coordinator user exists and has coordinator role
  const coordinator = await User.findById(coordinatorId);
  if (!coordinator) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Coordinator not found");
  }

  if (coordinator.role !== USER_ROLES.COORDINATOR) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "User is not a coordinator");
  }

  // Business rule: Coordinators can only be assigned to their own department
  // If coordinator already has a department assigned, they can only be assigned to that same department
  if (coordinator.department) {
    if (coordinator.department.toString() !== departmentId) {
      // Get department names for better error message
      const coordinatorDept = await Department.findById(
        coordinator.department
      ).select("name");
      const targetDept = await Department.findById(departmentId).select("name");

      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Coordinator ${coordinator.firstName} ${
          coordinator.lastName
        } belongs to ${
          coordinatorDept?.name || "another department"
        } and cannot be assigned to ${
          targetDept?.name || "this department"
        }. Coordinators can only be assigned to their own department.`
      );
    }
  } else {
    // If coordinator doesn't have a department yet, assign them to this one
    // This handles the case where coordinator was created without department assignment
    await User.findByIdAndUpdate(coordinatorId, {
      department: departmentId,
      faculty: department.faculty,
    });
  }

  // Update coordinator's department assignment
  await User.findByIdAndUpdate(coordinatorId, {
    department: departmentId,
    faculty: department.faculty,
  });

  // Add coordinator to department's coordinators array if not already there
  await Department.findByIdAndUpdate(departmentId, {
    $addToSet: { coordinators: coordinatorId },
    updatedAt: new Date(),
  });

  // Return updated department with coordinator info
  const updatedDepartment = await Department.findById(departmentId)
    .populate("faculty", "name code")
    .populate("coordinators", "firstName lastName email")
    .populate("createdBy", "firstName lastName email");

  return updatedDepartment;
};

/**
 * Get coordinators available for assignment to a specific department
 * Business rule: Only coordinators from this department or unassigned coordinators
 * @param {string} departmentId - Department ID
 * @returns {Promise<Array>} Available coordinators
 */
const getCoordinatorsForDepartment = async (departmentId) => {
  const coordinators = await User.find({
    role: USER_ROLES.COORDINATOR,
    isActive: true,
    $or: [
      { department: null }, // Unassigned coordinators
      { department: departmentId }, // Coordinators already in this department
    ],
  })
    .select("firstName lastName email department faculty")
    .populate("department", "name")
    .populate("faculty", "name");

  return coordinators;
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByFaculty,
  getDepartmentStats,
  assignCoordinator,
  getCoordinatorsForDepartment,
};
