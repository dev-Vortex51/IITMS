/**
 * User Management Service
 * Handles user creation and management by admins and coordinators
 * Implements user creation flow as per system requirements
 */

const { User, Department, Faculty, Student, Supervisor } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../utils/constants");
const { generateSecurePassword } = require("../utils/helpers");
const config = require("../config");
const logger = require("../utils/logger");
const notificationService = require("./notificationService");

/**
 * Create a new user
 * Admin creates: Faculty, Department, Coordinator
 * Coordinator creates: Student, Departmental Supervisor
 * @param {Object} userData - User creation data
 * @param {Object} creatorUser - User creating this account
 * @returns {Promise<Object>} Created user with default password
 */
const createUser = async (userData, creatorUser) => {
  const { email, firstName, lastName, role, department, faculty, password } =
    userData;

  // Check permissions based on creator role
  if (creatorUser.role === USER_ROLES.ADMIN) {
    // Admin can create: Faculty, Department, Coordinator, Academic Supervisor
    const allowedRoles = [
      USER_ROLES.FACULTY,
      USER_ROLES.DEPARTMENT,
      USER_ROLES.COORDINATOR,
      USER_ROLES.ACADEMIC_SUPERVISOR,
    ];
    if (!allowedRoles.includes(role)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        `Admin cannot create users with role: ${role}`
      );
    }
  } else if (creatorUser.role === USER_ROLES.COORDINATOR) {
    // Coordinator can create: Student, Industrial Supervisor (Academic supervisors created by Admin)
    const allowedRoles = [USER_ROLES.STUDENT, USER_ROLES.INDUSTRIAL_SUPERVISOR];
    if (!allowedRoles.includes(role)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        `Coordinator cannot create users with role: ${role}`
      );
    }
  } else {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You do not have permission to create users"
    );
  }

  // Check if user with email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "User with this email already exists"
    );
  }

  // Validate department/faculty requirements
  if ([USER_ROLES.STUDENT, USER_ROLES.COORDINATOR].includes(role)) {
    if (!department) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Department is required for this role"
      );
    }

    const deptExists = await Department.findById(department);
    if (!deptExists) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }
  }

  // Academic supervisors can optionally have a department but not required
  if (role === USER_ROLES.ACADEMIC_SUPERVISOR && department) {
    const deptExists = await Department.findById(department);
    if (!deptExists) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Department not found");
    }
  }

  // Use provided password or generate default password
  const userPassword = password || config.password.default;

  // Create user
  const user = await User.create({
    email,
    firstName,
    lastName,
    role,
    password: userPassword,
    isFirstLogin: true,
    passwordResetRequired: true,
    phone: userData.phone,
    address: userData.address,
    // Only assign department for coordinators and students (academic supervisors are cross-department)
    department: [USER_ROLES.COORDINATOR, USER_ROLES.STUDENT].includes(role)
      ? department
      : undefined,
  });

  // Create role-specific profile
  console.log("[userService] Creating user with role:", role);
  console.log("[userService] USER_ROLES.STUDENT:", USER_ROLES.STUDENT);
  console.log(
    "[userService] USER_ROLES.ACADEMIC_SUPERVISOR:",
    USER_ROLES.ACADEMIC_SUPERVISOR
  );

  if (role === USER_ROLES.STUDENT) {
    console.log("[userService] Creating student profile");
    await createStudentProfile(user._id, userData, creatorUser._id);
  } else if (role === USER_ROLES.ACADEMIC_SUPERVISOR) {
    console.log("[userService] Creating academic supervisor profile");
    console.log(
      "[userService] Department ID (optional):",
      userData.department || department || "None (cross-department)"
    );
    try {
      const supervisor = await createSupervisorProfile(
        user._id,
        "academic",
        {
          ...userData,
          department: userData.department || department,
          maxStudents: 10,
        },
        creatorUser._id
      );
      console.log(
        "[userService] Academic supervisor profile created:",
        supervisor._id
      );
    } catch (error) {
      console.error(
        "[userService] ERROR creating supervisor profile:",
        error.message
      );
      console.error("[userService] Full error:", error);
      throw error; // Re-throw to prevent user creation without profile
    }
  } else if (role === USER_ROLES.INDUSTRIAL_SUPERVISOR) {
    console.log("[userService] Creating industrial supervisor profile");
    console.log("[userService] userData:", JSON.stringify(userData, null, 2));
    try {
      const supervisor = await createSupervisorProfile(
        user._id,
        "industrial",
        userData,
        creatorUser._id
      );
      console.log(
        "[userService] Industrial supervisor profile created:",
        supervisor._id
      );

      // Auto-assign to students with pending/approved placements with this supervisor email
      const Placement = require("../models").Placement;
      const placements = await Placement.find({
        supervisorEmail: email,
        status: { $in: ["pending", "approved"] },
      }).populate("student");

      for (const placement of placements) {
        const student = placement.student;

        // Update placement with supervisor reference
        placement.industrialSupervisor = supervisor._id;
        placement.supervisorAssignedAt = new Date();
        await placement.save();

        // Add student to supervisor's assigned students
        if (!supervisor.assignedStudents.includes(student._id)) {
          supervisor.assignedStudents.push(student._id);
        }

        // Update student record if placement is approved
        if (placement.status === "approved" && !student.industrialSupervisor) {
          student.industrialSupervisor = supervisor._id;
          await student.save();
        }
      }

      if (supervisor.assignedStudents.length > 0) {
        await supervisor.save();
        console.log(
          `[userService] Assigned ${supervisor.assignedStudents.length} students to new supervisor`
        );
      }
    } catch (error) {
      console.error(
        "[userService] ERROR creating industrial supervisor profile:",
        error.message
      );
      console.error("[userService] Full error:", error);
      throw error; // Re-throw to prevent user creation without profile
    }
  }

  // Add coordinator to department if applicable
  if (role === USER_ROLES.COORDINATOR && department) {
    const dept = await Department.findById(department);
    await dept.addCoordinator(user._id);
  }

  // Send notification about account creation
  await notificationService.createNotification({
    recipient: user._id,
    type: "account_created",
    title: "Account Created",
    message: `Your account has been created. Email: ${email}, Password: ${userPassword}. Please login and change your password.`,
    priority: "high",
    createdBy: creatorUser._id,
  });

  logger.info(`User created: ${user.email} by ${creatorUser.email}`);

  return {
    user: user.toJSON(),
    defaultPassword: userPassword, // Return this for display purposes (in real app, send via email)
  };
};

/**
 * Create student profile
 * @param {ObjectId} userId - User ID
 * @param {Object} studentData - Student-specific data
 * @param {ObjectId} creatorId - Creator user ID
 * @returns {Promise<Object>} Created student profile
 */
const createStudentProfile = async (userId, studentData, creatorId) => {
  const student = await Student.create({
    user: userId,
    matricNumber: studentData.matricNumber,
    department: studentData.department,
    level: studentData.level,
    session: studentData.session,
    cgpa: studentData.cgpa,
    createdBy: creatorId,
  });

  return student;
};

/**
 * Create supervisor profile
 * @param {ObjectId} userId - User ID
 * @param {string} type - 'departmental' or 'industrial'
 * @param {Object} supervisorData - Supervisor-specific data
 * @param {ObjectId} creatorId - Creator user ID
 * @returns {Promise<Object>} Created supervisor profile
 */
const createSupervisorProfile = async (
  userId,
  type,
  supervisorData,
  creatorId
) => {
  console.log("[createSupervisorProfile] Creating supervisor with data:", {
    userId,
    type,
    department: supervisorData.department,
    companyName: supervisorData.companyName,
    companyAddress: supervisorData.companyAddress,
    position: supervisorData.position,
  });

  const supervisorPayload = {
    user: userId,
    type,
    createdBy: creatorId,
    position: supervisorData.position,
    qualification: supervisorData.qualification,
    yearsOfExperience: supervisorData.yearsOfExperience,
    specialization: supervisorData.specialization,
    maxStudents: supervisorData.maxStudents || 10,
  };

  // Add type-specific fields
  if (type === "academic") {
    // Academic supervisors can optionally have a department (for reference only)
    if (supervisorData.department) {
      supervisorPayload.department = supervisorData.department;
    }
  } else if (type === "industrial") {
    // For industrial supervisors, companyName is required
    console.log(
      "[createSupervisorProfile] Industrial supervisor data - companyName:",
      supervisorData.companyName
    );
    console.log(
      "[createSupervisorProfile] Industrial supervisor data - companyAddress:",
      supervisorData.companyAddress
    );

    if (!supervisorData.companyName) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Company name is required for industrial supervisors. Please provide companyName in the request."
      );
    }
    supervisorPayload.companyName = supervisorData.companyName;
    if (supervisorData.companyAddress) {
      supervisorPayload.companyAddress = supervisorData.companyAddress;
    }
  }

  const supervisor = await Supervisor.create(supervisorPayload);

  console.log(
    "[createSupervisorProfile] Supervisor created successfully:",
    supervisor._id
  );
  return supervisor;
};

/**
 * Create industrial supervisor (after placement approval)
 * @param {Object} supervisorData - Supervisor data
 * @param {ObjectId} creatorId - Creator user ID
 * @returns {Promise<Object>} Created supervisor
 */
const createIndustrialSupervisor = async (supervisorData, creatorId) => {
  const {
    email,
    firstName,
    lastName,
    companyName,
    companyAddress,
    position,
    phone,
  } = supervisorData;

  // Check if user already exists
  let user = await User.findOne({ email });

  if (!user) {
    const defaultPassword = config.password.default;

    user = await User.create({
      email,
      firstName,
      lastName,
      role: USER_ROLES.INDUSTRIAL_SUPERVISOR,
      password: defaultPassword,
      phone,
      isFirstLogin: true,
      passwordResetRequired: true,
    });

    // Send notification
    await notificationService.createNotification({
      recipient: user._id,
      type: "account_created",
      title: "Supervisor Account Created",
      message: `You have been assigned as an industrial supervisor. Default password: ${defaultPassword}`,
      priority: "high",
      createdBy: creatorId,
    });
  }

  // Create supervisor profile
  const supervisor = await createSupervisorProfile(
    user._id,
    "industrial",
    { companyName, companyAddress, position, ...supervisorData },
    creatorId
  );

  logger.info(`Industrial supervisor created: ${user.email}`);

  return { user, supervisor };
};

/**
 * Get all users with pagination and filtering
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination params
 * @returns {Promise<Object>} Users and metadata
 */
const getUsers = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const query = {};

  if (filters.role) query.role = filters.role;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  if (filters.search) {
    query.$or = [
      { firstName: new RegExp(filters.search, "i") },
      { lastName: new RegExp(filters.search, "i") },
      { email: new RegExp(filters.search, "i") },
    ];
  }

  const users = await User.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user by ID
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} User
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  return user;
};

/**
 * Update user
 * @param {ObjectId} userId - User ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated user
 */
const updateUser = async (userId, updateData) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "phone",
    "address",
    "isActive",
  ];
  const filteredData = {};

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, filteredData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  logger.info(`User updated: ${user.email}`);

  return user;
};

/**
 * Delete user (soft delete by deactivating)
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} Deleted user
 */
const deleteUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
  }

  logger.info(`User deactivated: ${user.email}`);

  return user;
};

module.exports = {
  createUser,
  createStudentProfile,
  createSupervisorProfile,
  createIndustrialSupervisor,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
