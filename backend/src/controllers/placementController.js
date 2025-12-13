/**
 * Placement Controller
 * HTTP request handlers for placement management
 */

const { placementService } = require("../services");
const { HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

/**
 * @desc    Create placement application
 * @route   POST /api/v1/placements
 * @access  Private (Student)
 */
const createPlacement = catchAsync(async (req, res) => {
  // Student ID from authenticated user
  const studentId = req.user.studentProfile;

  const placement = await placementService.createPlacement(
    studentId,
    req.body,
    req.files
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Placement application submitted successfully",
    data: placement,
  });
});

/**
 * @desc    Get all placements
 * @route   GET /api/v1/placements
 * @access  Private (Coordinator, Admin)
 */
const getPlacements = catchAsync(async (req, res) => {
  const filters = {
    status: req.query.status,
    student: req.query.student,
    department: req.query.department,
  };

  // If coordinator, filter by their department
  const { USER_ROLES } = require("../utils/constants");
  if (req.user.role === USER_ROLES.COORDINATOR && req.user.department) {
    filters.department = req.user.department;
  }

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await placementService.getPlacements(filters, pagination);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placements retrieved successfully",
    data: result.placements,
    pagination: result.pagination,
  });
});

/**
 * @desc    Get placement by ID
 * @route   GET /api/v1/placements/:id
 * @access  Private
 */
const getPlacementById = catchAsync(async (req, res) => {
  const placement = await placementService.getPlacementById(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement retrieved successfully",
    data: placement,
  });
});

/**
 * @desc    Update placement
 * @route   PUT /api/v1/placements/:id
 * @access  Private (Student - owner only)
 */
const updatePlacement = catchAsync(async (req, res) => {
  const placement = await placementService.updatePlacement(
    req.params.id,
    req.body,
    req.user._id
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement updated successfully",
    data: placement,
  });
});

/**
 * @desc    Review placement (approve/reject)
 * @route   POST /api/v1/placements/:id/review
 * @access  Private (Coordinator, Admin)
 */
const reviewPlacement = catchAsync(async (req, res) => {
  const placement = await placementService.reviewPlacement(
    req.params.id,
    req.body,
    req.user._id
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement reviewed successfully",
    data: placement,
  });
});

/**
 * @desc    Approve placement
 * @route   PATCH /api/v1/placements/:id/approve
 * @access  Private (Coordinator, Admin)
 */
const approvePlacement = catchAsync(async (req, res) => {
  const placement = await placementService.approvePlacement(
    req.params.id,
    req.body.remarks,
    req.user._id
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement approved successfully",
    data: placement,
  });
});

/**
 * @desc    Reject placement
 * @route   PATCH /api/v1/placements/:id/reject
 * @access  Private (Coordinator, Admin)
 */
const rejectPlacement = catchAsync(async (req, res) => {
  const placement = await placementService.rejectPlacement(
    req.params.id,
    req.body.remarks,
    req.user._id
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement rejected successfully",
    data: placement,
  });
});

/**
 * @desc    Assign industrial supervisor
 * @route   POST /api/v1/placements/:id/assign-supervisor
 * @access  Private (Coordinator, Admin)
 */
const assignIndustrialSupervisor = catchAsync(async (req, res) => {
  const placement = await placementService.assignIndustrialSupervisor(
    req.params.id,
    req.body,
    req.user._id
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Industrial supervisor assigned successfully",
    data: placement,
  });
});

/**
 * @desc    Update placement by coordinator (assign supervisors)
 * @route   PATCH /api/v1/placements/:id
 * @access  Private (Coordinator, Admin)
 */
const updatePlacementByCoordinator = catchAsync(async (req, res) => {
  const placement = await placementService.updatePlacementByCoordinator(
    req.params.id,
    req.body,
    req.user
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement updated successfully",
    data: placement,
  });
});

/**
 * @desc    Withdraw placement
 * @route   POST /api/v1/placements/:id/withdraw
 * @access  Private (Student - owner only)
 */
const withdrawPlacement = catchAsync(async (req, res) => {
  const placement = await placementService.withdrawPlacement(
    req.params.id,
    req.user._id
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement withdrawn successfully",
    data: placement,
  });
});

/**
 * @desc    Delete/withdraw placement
 * @route   DELETE /api/v1/placements/:id
 * @access  Private (Student - owner only)
 */
const deletePlacement = catchAsync(async (req, res) => {
  await placementService.deletePlacement(req.params.id, req.user._id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Placement withdrawn successfully",
  });
});

module.exports = {
  createPlacement,
  getPlacements,
  getPlacementById,
  updatePlacement,
  withdrawPlacement,
  reviewPlacement,
  approvePlacement,
  rejectPlacement,
  assignIndustrialSupervisor,
  updatePlacementByCoordinator,
  deletePlacement,
};
