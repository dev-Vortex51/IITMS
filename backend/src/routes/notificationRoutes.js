/**
 * Notification Routes
 * API routes for notification management
 */

const express = require("express");
const router = express.Router();
const { notificationController } = require("../controllers");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications
 * @access  Private (Authenticated users)
 */
router.get("/", notificationController.getNotifications);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private (Authenticated users)
 */
router.get("/unread-count", notificationController.getUnreadCount);

/**
 * @route   PUT /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private (Authenticated users)
 */
router.put("/read-all", notificationController.markAllAsRead);

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private (Authenticated users)
 */
router.put("/:id/read", notificationController.markAsRead);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete notification
 * @access  Private (Authenticated users)
 */
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
