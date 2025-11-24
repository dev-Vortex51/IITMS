/**
 * Placement Service
 * Business logic for placement management
 */

const { Placement, Student, Notification } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const {
  HTTP_STATUS,
  PLACEMENT_STATUS,
  NOTIFICATION_TYPES,
} = require("../utils/constants");
const { parsePagination, buildPaginationMeta } = require("../utils/helpers");
const logger = require("../utils/logger");
const notificationService = require("./notificationService");
const userService = require("./userService");

/**
 * Create placement application
 */
const createPlacement = async (studentId, placementData, files = {}) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Student not found");
  }

  // Check if student already has pending or approved placement
  const existingPlacement = await Placement.findOne({
    student: studentId,
    status: { $in: [PLACEMENT_STATUS.PENDING, PLACEMENT_STATUS.APPROVED] },
  });

  if (existingPlacement) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "You already have a pending or approved placement application"
    );
  }

  const placement = await Placement.create({
    student: studentId,
    ...placementData,
    acceptanceLetter: files.acceptanceLetter?.path,
    status: PLACEMENT_STATUS.PENDING,
  });

  logger.info(`Placement created for student: ${student.matricNumber}`);

  // Notify coordinators
  const Department = require("../models").Department;
  const dept = await Department.findById(student.department);

  if (dept && dept.coordinators.length > 0) {
    await notificationService.createBulkNotifications(dept.coordinators, {
      type: NOTIFICATION_TYPES.GENERAL,
      title: "New Placement Application",
      message: `Student ${student.user.fullName} has submitted a placement application`,
      priority: "medium",
      relatedModel: "Placement",
      relatedId: placement._id,
    });
  }

  return placement;
};

/**
 * Get all placements with filters
 */
const getPlacements = async (filters = {}, pagination = {}) => {
  const { page, limit, skip } = parsePagination(pagination);

  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.student) query.student = filters.student;
  if (filters.department) {
    const students = await Student.find({
      department: filters.department,
    }).select("_id");
    query.student = { $in: students.map((s) => s._id) };
  }

  const placements = await Placement.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ submittedAt: -1 });

  const total = await Placement.countDocuments(query);

  return {
    placements,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * Get placement by ID
 */
const getPlacementById = async (placementId) => {
  const placement = await Placement.findById(placementId);

  if (!placement) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
  }

  return placement;
};

/**
 * Update placement (before approval)
 */
const updatePlacement = async (placementId, updateData, userId) => {
  const placement = await Placement.findById(placementId);

  if (!placement) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
  }

  if (placement.status !== PLACEMENT_STATUS.PENDING) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Cannot update placement that has been reviewed"
    );
  }

  // Check if user is the student who created the placement
  const student = await Student.findById(placement.student);
  if (student.user.toString() !== userId.toString()) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You can only update your own placement"
    );
  }

  Object.assign(placement, updateData);
  await placement.save();

  logger.info(`Placement updated: ${placementId}`);

  return placement;
};

/**
 * Review placement (approve/reject)
 */
const reviewPlacement = async (placementId, reviewData, reviewerId) => {
  const placement = await Placement.findById(placementId);

  if (!placement) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
  }

  if (placement.status !== PLACEMENT_STATUS.PENDING) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Placement has already been reviewed"
    );
  }

  const { status, reviewComment } = reviewData;

  if (status === PLACEMENT_STATUS.APPROVED) {
    await placement.approve(reviewerId, reviewComment);

    // Update student record
    const student = await Student.findById(placement.student);
    student.hasPlacement = true;
    student.placementApproved = true;
    student.currentPlacement = placement._id;
    student.trainingStartDate = placement.startDate;
    student.trainingEndDate = placement.endDate;
    await student.save();

    // Send approval notification
    await notificationService.createNotification({
      recipient: student.user,
      type: NOTIFICATION_TYPES.PLACEMENT_APPROVED,
      title: "Placement Approved",
      message: `Your placement at ${placement.companyName} has been approved!`,
      priority: "high",
      relatedModel: "Placement",
      relatedId: placement._id,
      createdBy: reviewerId,
      sendEmail: true,
    });

    logger.info(`Placement approved: ${placementId}`);
  } else {
    await placement.reject(reviewerId, reviewComment);

    // Send rejection notification
    const student = await Student.findById(placement.student);
    await notificationService.createNotification({
      recipient: student.user,
      type: NOTIFICATION_TYPES.PLACEMENT_REJECTED,
      title: "Placement Not Approved",
      message: `Your placement application was not approved. Reason: ${reviewComment}`,
      priority: "high",
      relatedModel: "Placement",
      relatedId: placement._id,
      createdBy: reviewerId,
      sendEmail: true,
    });

    logger.info(`Placement rejected: ${placementId}`);
  }

  return placement;
};

/**
 * Assign industrial supervisor to placement
 */
const assignIndustrialSupervisor = async (
  placementId,
  supervisorData,
  assignerId
) => {
  const placement = await Placement.findById(placementId);

  if (!placement) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
  }

  if (placement.status !== PLACEMENT_STATUS.APPROVED) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Can only assign supervisor to approved placements"
    );
  }

  // Create or get industrial supervisor
  const { user, supervisor } = await userService.createIndustrialSupervisor(
    {
      ...supervisorData,
      companyName: placement.companyName,
      companyAddress: placement.companyAddress,
    },
    assignerId
  );

  // Assign to placement
  await placement.assignIndustrialSupervisor(supervisor._id);

  // Update student record
  const student = await Student.findById(placement.student);
  await student.assignSupervisor("industrial", supervisor._id);

  // Assign student to supervisor
  await supervisor.assignStudent(student._id);

  // Notify supervisor
  await notificationService.createNotification({
    recipient: user._id,
    type: NOTIFICATION_TYPES.SUPERVISOR_ASSIGNED,
    title: "Student Assigned",
    message: `You have been assigned as industrial supervisor for ${student.user.fullName}`,
    priority: "high",
    createdBy: assignerId,
    sendEmail: true,
  });

  // Notify student
  await notificationService.createNotification({
    recipient: student.user,
    type: NOTIFICATION_TYPES.SUPERVISOR_ASSIGNED,
    title: "Supervisor Assigned",
    message: `${user.fullName} has been assigned as your industrial supervisor`,
    priority: "medium",
    createdBy: assignerId,
  });

  logger.info(`Industrial supervisor assigned to placement: ${placementId}`);

  return placement;
};

/**
 * Delete placement (withdraw)
 */
const deletePlacement = async (placementId, userId) => {
  const placement = await Placement.findById(placementId);

  if (!placement) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Placement not found");
  }

  if (placement.status === PLACEMENT_STATUS.APPROVED) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Cannot delete approved placement. Please contact coordinator."
    );
  }

  placement.status = PLACEMENT_STATUS.WITHDRAWN;
  await placement.save();

  logger.info(`Placement withdrawn: ${placementId}`);

  return placement;
};

module.exports = {
  createPlacement,
  getPlacements,
  getPlacementById,
  updatePlacement,
  reviewPlacement,
  assignIndustrialSupervisor,
  deletePlacement,
};
