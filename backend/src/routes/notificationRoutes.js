const express = require("express");
const router = express.Router();
const { notificationController } = require("../controllers");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

router.get("/", notificationController.getNotifications);

router.get("/unread-count", notificationController.getUnreadCount);

router.put("/read-all", notificationController.markAllAsRead);

router.put("/:id/read", notificationController.markAsRead);

router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
