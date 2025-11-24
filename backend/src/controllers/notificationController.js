/**
 * Notification Controller
 * HTTP request handlers for notification management
 */

const { notificationService } = require("../services");
const { HTTP_STATUS } = require("../utils/constants");
const { catchAsync } = require("../utils/helpers");

/**
 * @desc    Get user notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
const getNotifications = catchAsync(async (req, res) => {
  const filters = {
    unreadOnly: req.query.unreadOnly === "true",
    type: req.query.type,
    priority: req.query.priority,
  };

  const pagination = {
    page: req.query.page,
    limit: req.query.limit,
  };

  const result = await notificationService.getUserNotifications(
    req.user._id,
    filters,
    pagination
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Notifications retrieved successfully",
    data: result.notifications,
    pagination: result.pagination,
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/v1/notifications/:id/read
 * @access  Private
 */
const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/v1/notifications/read-all
 * @access  Private
 */
const markAllAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "All notifications marked as read",
    data: result,
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
const deleteNotification = catchAsync(async (req, res) => {
  await notificationService.deleteNotification(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

/**
 * @desc    Get unread count
 * @route   GET /api/v1/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Unread count retrieved successfully",
    data: { count },
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
