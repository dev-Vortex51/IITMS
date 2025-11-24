/**
 * Supervisor Service
 * Business logic for supervisor management
 */

const { Supervisor, User, Student } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { HTTP_STATUS, SUPERVISOR_TYPES } = require("../utils/constants");
const { parsePagination, buildPaginationMeta } = require("../utils/helpers");
const logger = require("../utils/logger");

/**
 * Get all supervisors with filters
 */
const getSupervisors = async (filters = {}, pagination = {}) => {
  const { page, limit, skip } = parsePagination(pagination);

  const query = { isActive: true };

  if (filters.type) query.type = filters.type;
  if (filters.department) query.department = filters.department;
  if (filters.available !== undefined) {
    const supervisors = await Supervisor.find(query);
    const availableSupervisors = supervisors.filter(
      (s) => s.isAvailable === filters.available
    );

    return {
      supervisors: availableSupervisors.slice(skip, skip + limit),
      pagination: buildPaginationMeta(availableSupervisors.length, page, limit),
    };
  }

  const supervisors = await Supervisor.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Supervisor.countDocuments(query);

  return {
    supervisors,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Get supervisor by ID
 */
const getSupervisorById = async (supervisorId) => {
  const supervisor = await Supervisor.findById(supervisorId).populate(
    "assignedStudents"
  );

  if (!supervisor) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
  }

  return supervisor;
};

/**
 * Update supervisor profile
 */
const updateSupervisor = async (supervisorId, updateData) => {
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
      filteredData[field] = updateData[field];
    }
  });

  const supervisor = await Supervisor.findByIdAndUpdate(
    supervisorId,
    filteredData,
    { new: true, runValidators: true }
  );

  if (!supervisor) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
  }

  logger.info(`Supervisor updated: ${supervisorId}`);

  return supervisor;
};

/**
 * Get available supervisors for assignment
 */
const getAvailableSupervisors = async (type, departmentId = null) => {
  const query = { type, isActive: true };

  if (type === SUPERVISOR_TYPES.DEPARTMENTAL && departmentId) {
    query.department = departmentId;
  }

  const supervisors = await Supervisor.findAvailable(type, departmentId);

  return supervisors;
};

/**
 * Assign student to supervisor
 */
const assignStudentToSupervisor = async (supervisorId, studentId) => {
  const supervisor = await Supervisor.findById(supervisorId);

  if (!supervisor) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
  }

  if (!supervisor.isAvailable) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Supervisor has reached maximum student capacity"
    );
  }

  await supervisor.assignStudent(studentId);

  logger.info(`Student ${studentId} assigned to supervisor ${supervisorId}`);

  return supervisor;
};

/**
 * Unassign student from supervisor
 */
const unassignStudentFromSupervisor = async (supervisorId, studentId) => {
  const supervisor = await Supervisor.findById(supervisorId);

  if (!supervisor) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
  }

  await supervisor.unassignStudent(studentId);

  // Update student record
  const student = await Student.findById(studentId);
  if (supervisor.type === SUPERVISOR_TYPES.DEPARTMENTAL) {
    student.departmentalSupervisor = null;
  } else {
    student.industrialSupervisor = null;
  }
  await student.save();

  logger.info(
    `Student ${studentId} unassigned from supervisor ${supervisorId}`
  );

  return supervisor;
};

/**
 * Get supervisor dashboard data
 */
const getSupervisorDashboard = async (supervisorId) => {
  const supervisor = await Supervisor.findById(supervisorId).populate(
    "assignedStudents"
  );

  if (!supervisor) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
  }

  // Get pending logbooks
  const Logbook = require("../models").Logbook;
  const pendingLogbooks = await Logbook.findPendingReview(
    supervisorId,
    supervisor.type
  );

  // Get pending assessments
  const Assessment = require("../models").Assessment;
  const pendingAssessments = await Assessment.findPending(supervisorId);

  // Get student statistics
  const studentIds = supervisor.assignedStudents.map((s) => s._id);
  const totalLogbooks = await Logbook.countDocuments({
    student: { $in: studentIds },
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
    pendingLogbooks: pendingLogbooks.slice(0, 5),
    pendingAssessments: pendingAssessments.slice(0, 5),
  };
};

/**
 * Get supervisors by department
 */
const getSupervisorsByDepartment = async (departmentId, type = null) => {
  const query = { department: departmentId, isActive: true };

  if (type) {
    query.type = type;
  }

  const supervisors = await Supervisor.find(query);

  return supervisors;
};

module.exports = {
  getSupervisors,
  getSupervisorById,
  updateSupervisor,
  getAvailableSupervisors,
  assignStudentToSupervisor,
  unassignStudentFromSupervisor,
  getSupervisorDashboard,
  getSupervisorsByDepartment,
};
