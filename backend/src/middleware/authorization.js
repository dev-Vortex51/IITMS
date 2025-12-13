/**
 * Authorization Middleware
 * Role-based access control (RBAC)
 * Restricts access to routes based on user roles
 */

const {
  USER_ROLES,
  HTTP_STATUS,
  ERROR_MESSAGES,
} = require("../utils/constants");
const { formatResponse } = require("../utils/helpers");
const logger = require("../utils/logger");

/**
 * Check if user has required role(s)
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(formatResponse(false, ERROR_MESSAGES.UNAUTHORIZED));
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Unauthorized access attempt by user ${req.user.email} with role ${req.user.role}`
      );
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(formatResponse(false, ERROR_MESSAGES.FORBIDDEN));
    }

    next();
  };
};

/**
 * Admin only access
 */
const adminOnly = authorize(USER_ROLES.ADMIN);

/**
 * Coordinator only access
 */
const coordinatorOnly = authorize(USER_ROLES.COORDINATOR);

/**
 * Student only access
 */
const studentOnly = authorize(USER_ROLES.STUDENT);

/**
 * Supervisor only access (both types)
 */
const supervisorOnly = authorize(
  USER_ROLES.ACADEMIC_SUPERVISOR,
  USER_ROLES.INDUSTRIAL_SUPERVISOR
);

/**
 * Admin or Coordinator access
 */
const adminOrCoordinator = authorize(USER_ROLES.ADMIN, USER_ROLES.COORDINATOR);

/**
 * Check if user can access specific department
 * Used for coordinators and department supervisors
 */
const canAccessDepartment = (req, res, next) => {
  if (!req.user) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(formatResponse(false, ERROR_MESSAGES.UNAUTHORIZED));
  }

  // Admin can access all departments
  if (req.user.role === USER_ROLES.ADMIN) {
    return next();
  }

  const departmentId = req.params.departmentId || req.body.department;

  if (!departmentId) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(formatResponse(false, "Department ID is required"));
  }

  // For coordinators and department supervisors, check department association
  // This would require loading the coordinator/supervisor record
  // For now, we'll allow and rely on service layer to enforce
  next();
};

/**
 * Check if user owns the resource or is admin
 * Used for profile updates, etc.
 */
const ownerOrAdmin = async (req, res, next) => {
  if (!req.user) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(formatResponse(false, ERROR_MESSAGES.UNAUTHORIZED));
  }

  // Admin can access everything
  if (req.user.role === USER_ROLES.ADMIN) {
    return next();
  }

  const resourceUserId = req.params.userId || req.params.id;

  // Check if user is accessing their own resource
  if (req.user._id.toString() !== resourceUserId) {
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json(formatResponse(false, ERROR_MESSAGES.FORBIDDEN));
  }

  next();
};

/**
 * Check if student can access their own data or if supervisor/coordinator can access
 */
const studentDataAccess = async (req, res, next) => {
  if (!req.user) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(formatResponse(false, ERROR_MESSAGES.UNAUTHORIZED));
  }

  // Admin and coordinators can access all student data
  if ([USER_ROLES.ADMIN, USER_ROLES.COORDINATOR].includes(req.user.role)) {
    return next();
  }

  const studentId = req.params.studentId || req.params.id;

  // Students can only access their own data
  if (req.user.role === USER_ROLES.STUDENT) {
    const { Student } = require("../models");
    const student = await Student.findOne({ user: req.user._id });

    if (!student || student._id.toString() !== studentId) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(formatResponse(false, ERROR_MESSAGES.FORBIDDEN));
    }

    return next();
  }

  // Supervisors can access their assigned students
  if (
    [USER_ROLES.ACADEMIC_SUPERVISOR, USER_ROLES.INDUSTRIAL_SUPERVISOR].includes(
      req.user.role
    )
  ) {
    const { Supervisor } = require("../models");
    const supervisor = await Supervisor.findOne({ user: req.user._id });

    if (!supervisor || !supervisor.assignedStudents.includes(studentId)) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(formatResponse(false, ERROR_MESSAGES.FORBIDDEN));
    }

    return next();
  }

  // Default deny
  return res
    .status(HTTP_STATUS.FORBIDDEN)
    .json(formatResponse(false, ERROR_MESSAGES.FORBIDDEN));
};

/**
 * Check if supervisor can access logbook/assessment
 */
const supervisorAccess = async (req, res, next) => {
  if (!req.user) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(formatResponse(false, ERROR_MESSAGES.UNAUTHORIZED));
  }

  // Admin and coordinators have full access
  if ([USER_ROLES.ADMIN, USER_ROLES.COORDINATOR].includes(req.user.role)) {
    return next();
  }

  // Must be a supervisor
  if (
    ![
      USER_ROLES.ACADEMIC_SUPERVISOR,
      USER_ROLES.INDUSTRIAL_SUPERVISOR,
    ].includes(req.user.role)
  ) {
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json(formatResponse(false, ERROR_MESSAGES.FORBIDDEN));
  }

  const { Supervisor } = require("../models");
  const supervisor = await Supervisor.findOne({ user: req.user._id });

  if (!supervisor) {
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json(formatResponse(false, "Supervisor profile not found"));
  }

  // Attach supervisor to request for later use
  req.supervisor = supervisor;
  next();
};

/**
 * Rate limiting for specific roles
 * More restrictive for students
 */
const roleLimits = {
  [USER_ROLES.ADMIN]: 1000,
  [USER_ROLES.COORDINATOR]: 500,
  [USER_ROLES.ACADEMIC_SUPERVISOR]: 300,
  [USER_ROLES.INDUSTRIAL_SUPERVISOR]: 300,
  [USER_ROLES.STUDENT]: 200,
};

module.exports = {
  authorize,
  // Backward compatibility: routes may import requireRole
  requireRole: authorize,
  adminOnly,
  coordinatorOnly,
  studentOnly,
  supervisorOnly,
  adminOrCoordinator,
  canAccessDepartment,
  ownerOrAdmin,
  studentDataAccess,
  supervisorAccess,
  roleLimits,
};
