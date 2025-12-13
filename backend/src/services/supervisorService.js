/**
 * Supervisor Service
 * Business logic for supervisor management
 */

const {
  Supervisor,
  User,
  Student,
  Department,
  Placement,
} = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  SUPERVISOR_TYPES,
  USER_ROLES,
} = require("../utils/constants");
const { parsePagination, buildPaginationMeta } = require("../utils/helpers");
const logger = require("../utils/logger");

/**
 * Get all supervisors with filters
 */
const getSupervisors = async (filters = {}, pagination = {}) => {
  const { page, limit, skip } = parsePagination(pagination);

  let query = { isActive: true };

  // Handle type filter
  if (filters.type) {
    // Treat "departmental" as an alias for academic supervisors
    if (filters.type === "departmental") {
      query.type = { $in: ["academic", "departmental"] };
    } else if (filters.type === "academic") {
      query.type = { $in: ["academic", "departmental"] };
    } else {
      query.type = filters.type;
    }
  }

  // Handle company filter for industrial supervisors
  if (filters.companyName && filters.type === "industrial") {
    query.companyName = new RegExp(`^${filters.companyName}$`, "i");
  }

  // Handle department filter
  if (filters.department) {
    query.department = filters.department;
  } else if (filters.coordinatorDepartment && !filters.type) {
    // For coordinators without an explicit type filter, include academic supervisors
    // (any department), cross-department academics (no dept), and all industrials.
    query.$or = [
      { type: "academic" },
      { type: "departmental" },
      { type: "academic", department: { $in: [null, undefined] } },
      { type: "departmental", department: { $in: [null, undefined] } },
      { type: "industrial" },
    ];
  }

  // Debug logging
  console.log("[supervisorService] Query:", JSON.stringify(query, null, 2));

  // Count all supervisors in database
  const allSupervisorsCount = await Supervisor.countDocuments({});
  console.log(
    "[supervisorService] Total supervisors in DB:",
    allSupervisorsCount
  );
  console.log(
    "[supervisorService] Active supervisors matching query:",
    await Supervisor.countDocuments(query)
  );

  if (filters.available !== undefined) {
    const supervisors = await Supervisor.find(query)
      .populate("user", "firstName lastName email phone")
      .populate("department", "name code");
    const availableSupervisors = supervisors.filter(
      (s) => s.isAvailable === filters.available
    );

    return {
      supervisors: availableSupervisors.slice(skip, skip + limit),
      pagination: buildPaginationMeta(availableSupervisors.length, page, limit),
    };
  }

  const supervisors = await Supervisor.find(query)
    .populate("user", "firstName lastName email phone")
    .populate("department", "name code")
    .populate("assignedStudents")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Supervisor.countDocuments(query);

  // Transform supervisors to include user fields at top level for frontend compatibility
  const transformedSupervisors = supervisors.map((supervisor) => {
    const sup = supervisor.toObject();

    // Debug log to see what's in the user field
    if (!sup.user || !sup.user.firstName) {
      console.log(
        "[supervisorService] Supervisor with missing/incomplete user data:",
        {
          supervisorId: sup._id,
          userId: sup.user?._id || "NO USER",
          userName: sup.user
            ? `${sup.user.firstName} ${sup.user.lastName}`
            : "NULL USER",
        }
      );
    }

    return {
      ...sup,
      name:
        sup.user && sup.user.firstName && sup.user.lastName
          ? `${sup.user.firstName} ${sup.user.lastName}`
          : "Unknown",
      email: sup.user?.email || null,
      phone: sup.user?.phone || null,
      students: sup.assignedStudents || [],
    };
  });

  return {
    supervisors: transformedSupervisors,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Get supervisor by ID
 */
const getSupervisorById = async (supervisorId) => {
  const supervisor = await Supervisor.findById(supervisorId)
    .populate("user", "firstName lastName email phone")
    .populate("department", "name code")
    .populate("assignedStudents");

  if (!supervisor) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Supervisor not found");
  }

  // Transform to include user fields at top level
  const sup = supervisor.toObject();
  return {
    ...sup,
    name: sup.user ? `${sup.user.firstName} ${sup.user.lastName}` : "Unknown",
    email: sup.user?.email,
    phone: sup.user?.phone,
    students: sup.assignedStudents || [],
  };
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
  // Use the model's findAvailable method which handles type logic
  const supervisors = await Supervisor.findAvailable(type, departmentId);

  // Transform to include user info at top level for frontend compatibility
  const transformedSupervisors = supervisors.map((supervisor) => {
    const sup = supervisor.toObject();
    return {
      ...sup,
      name: sup.user ? `${sup.user.firstName} ${sup.user.lastName}` : "Unknown",
      email: sup.user?.email,
      phone: sup.user?.phone,
    };
  });

  return transformedSupervisors;
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
  const supervisor = await Supervisor.findById(supervisorId).populate({
    path: "assignedStudents",
    populate: [
      {
        path: "user",
        select: "firstName lastName email",
      },
      {
        path: "currentPlacement",
        select: "companyName status",
      },
    ],
  });

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

/**
 * Suggest supervisors for a student
 * - Academic: faculty-constrained, capacity-aware, cross-department allowed if no department set
 * - Industrial: company-matched suggestions for the student's current placement
 */
const suggestSupervisors = async (studentId, type, user) => {
  if (!studentId || !type) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Student ID and type are required"
    );
  }

  const student = await Student.findById(studentId)
    .populate({
      path: "department",
      populate: { path: "faculty", select: "name code" },
    })
    .populate("currentPlacement");

  if (!student) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
  }

  // Coordinators can only fetch suggestions for their department's students
  if (
    user &&
    user.role === USER_ROLES.COORDINATOR &&
    user.department &&
    student.department &&
    student.department._id.toString() !== user.department.toString()
  ) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You can only fetch suggestions for students in your department"
    );
  }

  const studentFacultyId = student.department?.faculty?._id?.toString();

  // Academic / departmental suggestions (faculty constrained)
  if (
    type === SUPERVISOR_TYPES.ACADEMIC ||
    type === SUPERVISOR_TYPES.DEPARTMENTAL
  ) {
    const supervisors = await Supervisor.find({
      isActive: true,
      type: { $in: [SUPERVISOR_TYPES.ACADEMIC, SUPERVISOR_TYPES.DEPARTMENTAL] },
    })
      .populate("user", "firstName lastName email phone")
      .populate({
        path: "department",
        populate: { path: "faculty", select: "name code" },
      })
      .populate("assignedStudents");

    const filtered = supervisors
      .filter(
        (sup) => (sup.assignedStudents || []).length < (sup.maxStudents || 0)
      )
      .filter((sup) => {
        if (!studentFacultyId) return true; // fallback
        if (!sup.department) return true; // cross-department supervisor allowed
        const supFacultyId = sup.department.faculty?._id?.toString();
        return supFacultyId === studentFacultyId;
      })
      .map((sup) => {
        const assignedCount = (sup.assignedStudents || []).length;
        const remaining = (sup.maxStudents || 0) - assignedCount;
        const facultyMatched =
          sup.department?.faculty?._id?.toString() === studentFacultyId;
        return {
          ...sup.toObject(),
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

  // Industrial suggestions: match by company for the student's placement
  if (type === SUPERVISOR_TYPES.INDUSTRIAL) {
    let placement = student.currentPlacement;
    if (!placement) {
      placement = await Placement.findOne({ student: studentId })
        .sort({ createdAt: -1 })
        .lean();
    }

    const companyName = placement?.companyName;
    const query = { isActive: true, type: SUPERVISOR_TYPES.INDUSTRIAL };

    const supervisors = await Supervisor.find(query)
      .populate("user", "firstName lastName email phone")
      .populate("assignedStudents");

    const matches = supervisors
      .map((sup) => {
        const assignedCount = (sup.assignedStudents || []).length;
        const remaining = (sup.maxStudents || 0) - assignedCount;
        const companyMatched =
          companyName && sup.companyName
            ? sup.companyName.toLowerCase() === companyName.toLowerCase()
            : false;
        return {
          ...sup.toObject(),
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
        // If we have a company name, prioritize and filter by company match
        if (companyName) {
          return sup.companyMatched && sup.score > 0;
        }
        // If no company name found, show all available
        return sup.score > 0;
      })
      .sort((a, b) => b.score - a.score);

    return matches;
  }

  throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Unsupported supervisor type");
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
