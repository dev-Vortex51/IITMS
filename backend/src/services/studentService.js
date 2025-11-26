/**
 * Student Service
 * Business logic for student management
 */

const {
  Student,
  User,
  Department,
  Placement,
  Logbook,
  Assessment,
} = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS, USER_ROLES } = require("../utils/constants");
const { parsePagination, buildPaginationMeta } = require("../utils/helpers");
const logger = require("../utils/logger");

/**
 * Get all students (no filters, no pagination)
 */
const getAllStudents = async (filters = {}) => {
  const logger = require("../utils/logger");
  logger.info("studentService.getAllStudents called");

  const query = { isActive: true };

  // Add department filter if provided
  if (filters.department) {
    query.department = filters.department;
  }

  const students = await Student.find(query)
    .populate("user", "firstName lastName email")
    .populate("department", "name code")
    .populate("currentPlacement")
    .populate("departmentalSupervisor", "name email")
    .populate("industrialSupervisor", "name email")
    .lean();

  // Format students with user data
  const formattedStudents = students.map((student) => ({
    _id: student._id,
    matricNumber: student.matricNumber,
    level: student.level,
    session: student.session,
    placementApproved: student.placementApproved,
    department: student.department,
    placement: student.currentPlacement,
    departmentalSupervisor: student.departmentalSupervisor,
    industrialSupervisor: student.industrialSupervisor,
    name: student.user
      ? `${student.user.firstName} ${student.user.lastName}`
      : "N/A",
    email: student.user?.email,
  }));

  logger.info(
    `studentService.getAllStudents fetched ${formattedStudents.length} students`
  );

  return formattedStudents;
};

/**
 * Get all students with filters and pagination
 */
const getStudents = async (filters = {}, pagination = {}, user = null) => {
  const { page, limit, skip } = parsePagination(pagination);

  const query = { isActive: true };

  // Coordinator access control - only see students from their department
  if (user && user.role === USER_ROLES.COORDINATOR && user.department) {
    query.department = user.department;
  } else if (filters.department) {
    query.department = filters.department;
  }

  if (filters.level) query.level = filters.level;
  if (filters.session) query.session = filters.session;
  if (filters.placementApproved !== undefined)
    query.placementApproved = filters.placementApproved;

  if (filters.search) {
    const users = await User.find({
      $or: [
        { firstName: new RegExp(filters.search, "i") },
        { lastName: new RegExp(filters.search, "i") },
        { email: new RegExp(filters.search, "i") },
      ],
    }).select("_id");

    const userIds = users.map((u) => u._id);
    query.user = { $in: userIds };
  }

  console.log("Student query:", JSON.stringify(query));
  console.log("Pagination:", { page, limit, skip });

  const students = await Student.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Student.countDocuments(query);

  console.log("Students found:", students.length, "Total:", total);

  return {
    students,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Get student by ID
 */
const getStudentById = async (studentId) => {
  const student = await Student.findById(studentId)
    .populate("currentPlacement")
    .populate("departmentalSupervisor")
    .populate("industrialSupervisor");

  if (!student) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
  }

  return student;
};

/**
 * Update student profile
 */
const updateStudent = async (studentId, updateData) => {
  const allowedFields = ["level", "cgpa", "address", "phone"];
  const filteredData = {};

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  const student = await Student.findByIdAndUpdate(studentId, filteredData, {
    new: true,
    runValidators: true,
  });

  if (!student) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
  }

  // Also update user profile if provided
  if (updateData.firstName || updateData.lastName || updateData.bio) {
    await User.findByIdAndUpdate(student.user, {
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      bio: updateData.bio,
    });
  }

  logger.info(`Student updated: ${student.matricNumber}`);

  return student;
};

/**
 * Get student dashboard data
 */
const getStudentDashboard = async (studentId) => {
  const student = await Student.findById(studentId)
    .populate("currentPlacement")
    .populate("departmentalSupervisor")
    .populate("industrialSupervisor");

  if (!student) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
  }

  // Get statistics
  const logbookCount = await Logbook.countDocuments({ student: studentId });
  const approvedLogbooks = await Logbook.countDocuments({
    student: studentId,
    status: "approved",
  });
  const assessmentCount = await Assessment.countDocuments({
    student: studentId,
  });

  // Get recent logbooks
  const recentLogbooks = await Logbook.find({ student: studentId })
    .sort({ createdAt: -1 })
    .limit(5);

  // Get placements
  const placements = await Placement.find({ student: studentId }).sort({
    createdAt: -1,
  });

  return {
    student,
    statistics: {
      totalLogbooks: logbookCount,
      approvedLogbooks,
      totalAssessments: assessmentCount,
      trainingProgress: student.getTrainingProgress(),
    },
    recentLogbooks,
    placements,
  };
};

/**
 * Assign supervisor to student
 */
const assignSupervisor = async (studentId, supervisorId, type) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
  }

  await student.assignSupervisor(type, supervisorId);

  // Update supervisor's assigned students
  const Supervisor = require("../models").Supervisor;
  const supervisor = await Supervisor.findById(supervisorId);
  await supervisor.assignStudent(studentId);

  logger.info(`${type} supervisor assigned to student ${student.matricNumber}`);

  return student;
};

/**
 * Get students by department
 */
const getStudentsByDepartment = async (departmentId, filters = {}) => {
  const query = { department: departmentId, isActive: true };

  if (filters.level) query.level = filters.level;
  if (filters.session) query.session = filters.session;

  const students = await Student.find(query).sort({ matricNumber: 1 });

  return students;
};

module.exports = {
  getAllStudents,
  getStudents,
  getStudentById,
  updateStudent,
  getStudentDashboard,
  assignSupervisor,
  getStudentsByDepartment,
};
