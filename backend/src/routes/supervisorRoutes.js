const express = require("express");
const router = express.Router();
const { supervisorController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");

// All routes require authentication
router.use(authenticate);

router.get(
  "/",
  requireRole(
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.ACADEMIC_SUPERVISOR,
    ROLES.INDUSTRIAL_SUPERVISOR,
  ),
  supervisorController.getSupervisors,
);

router.get(
  "/available",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  supervisorController.getAvailableSupervisors,
);

router.get(
  "/suggestions",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  supervisorController.getSupervisorSuggestions,
);

router.get("/:id", supervisorController.getSupervisorById);

router.put(
  "/:id",
  requireRole(
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.ACADEMIC_SUPERVISOR,
    ROLES.INDUSTRIAL_SUPERVISOR,
  ),
  supervisorController.updateSupervisor,
);

router.get(
  "/:id/dashboard",
  requireRole(
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.ACADEMIC_SUPERVISOR,
    ROLES.INDUSTRIAL_SUPERVISOR,
  ),
  supervisorController.getSupervisorDashboard,
);

router.post(
  "/:id/assign-student",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  supervisorController.assignStudent,
);

router.post(
  "/:id/unassign-student",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  supervisorController.unassignStudent,
);

module.exports = router;
