/**
 * Logbook Controller
 * HTTP request handlers for logbook management
 */

const { logbookService } = require("../services");
const { HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

/**
 * @desc    Create logbook entry
 * @route   POST /api/v1/logbooks
 * @access  Private (Student)
 */
const createLogbookEntry = catchAsync(async (req, res) => {
  const studentId = req.user.studentProfile;

  const logbook = await logbookService.createLogbookEntry(
    studentId,
    req.body,
    req.files || []
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Logbook entry created successfully",
    data: logbook,
  });
});

/**
 * @desc    Get all logbooks
 * @route   GET /api/v1/logbooks
 * @access  Private
 */
const getLogbooks = catchAsync(async (req, res) => {
  const filters = {
    student: req.query.student,
    status: req.query.status,
    weekNumber: req.query.weekNumber,
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

  const result = await logbookService.getLogbooks(filters, pagination);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logbooks retrieved successfully",
    data: result.logbooks,
    pagination: result.pagination,
  });
});

/**
 * @desc    Get logbook by ID
 * @route   GET /api/v1/logbooks/:id
 * @access  Private
 */
const getLogbookById = catchAsync(async (req, res) => {
  const logbook = await logbookService.getLogbookById(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logbook retrieved successfully",
    data: logbook,
  });
});

/**
 * @desc    Update logbook entry
 * @route   PUT /api/v1/logbooks/:id
 * @access  Private (Student - owner only)
 */
const updateLogbookEntry = catchAsync(async (req, res) => {
  const logbook = await logbookService.updateLogbookEntry(
    req.params.id,
    req.body,
    req.user._id
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logbook entry updated successfully",
    data: logbook,
  });
});

/**
 * @desc    Submit logbook entry
 * @route   POST /api/v1/logbooks/:id/submit
 * @access  Private (Student - owner only)
 */
const submitLogbookEntry = catchAsync(async (req, res) => {
  const logbook = await logbookService.submitLogbookEntry(
    req.params.id,
    req.user._id
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logbook entry submitted successfully",
    data: logbook,
  });
});

/**
 * @desc    Review logbook
 * @route   POST /api/v1/logbooks/:id/review
 * @access  Private (Supervisor)
 */
const reviewLogbook = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;
  const supervisorType = req.user.supervisorType; // From auth middleware

  const logbook = await logbookService.reviewLogbook(
    req.params.id,
    req.body,
    supervisorId,
    supervisorType
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logbook reviewed successfully",
    data: logbook,
  });
});

/**
 * @desc    Get pending logbooks for supervisor
 * @route   GET /api/v1/logbooks/pending-review
 * @access  Private (Supervisor)
 */
const getLogbooksPendingReview = catchAsync(async (req, res) => {
  const supervisorId = req.user.supervisorProfile;

  const logbooks = await logbookService.getLogbooksPendingReview(supervisorId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Pending logbooks retrieved successfully",
    data: logbooks,
  });
});

/**
 * @desc    Get student logbook summary
 * @route   GET /api/v1/students/:studentId/logbooks/summary
 * @access  Private
 */
const getStudentLogbookSummary = catchAsync(async (req, res) => {
  const summary = await logbookService.getStudentLogbookSummary(
    req.params.studentId
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logbook summary retrieved successfully",
    data: summary,
  });
});

module.exports = {
  createLogbookEntry,
  getLogbooks,
  getLogbookById,
  updateLogbookEntry,
  submitLogbookEntry,
  reviewLogbook,
  getLogbooksPendingReview,
  getStudentLogbookSummary,
};
