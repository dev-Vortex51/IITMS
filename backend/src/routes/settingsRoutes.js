const express = require("express");
const router = express.Router();
const {
  getSystemSettings,
  updateSystemSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
} = require("../controllers/settingsController");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");

// All routes require authentication
router.use(authenticate);

// System settings routes (Admin only)
router
  .route("/system")
  .get(requireRole(ROLES.ADMIN), getSystemSettings)
  .put(requireRole(ROLES.ADMIN), updateSystemSettings);

// Notification preferences routes (All authenticated users)
router
  .route("/notifications")
  .get(getNotificationPreferences)
  .put(updateNotificationPreferences);

module.exports = router;
