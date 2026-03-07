const express = require("express");
const router = express.Router();
const { placementController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { cacheResponse } = require("../middleware/cache");
const config = require("../config");
const { ROLES } = require("../utils/constants");

// All routes require authentication
router.use(authenticate);

router.post(
  "/",
  requireRole(ROLES.STUDENT),
  placementController.createPlacement,
);

router.get(
  "/",
  requireRole(
    ROLES.ADMIN,
    ROLES.COORDINATOR,
    ROLES.ACADEMIC_SUPERVISOR,
    ROLES.INDUSTRIAL_SUPERVISOR,
  ),
  cacheResponse(config.cache.dashboardTtl),
  placementController.getPlacements,
);

router.get("/:id", placementController.getPlacementById);

router.put(
  "/:id",
  requireRole(ROLES.STUDENT),
  placementController.updatePlacement,
);

router.post(
  "/:id/withdraw",
  requireRole(ROLES.STUDENT),
  placementController.withdrawPlacement,
);

router.post(
  "/:id/review",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  placementController.reviewPlacement,
);

router.patch(
  "/:id/approve",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  placementController.approvePlacement,
);

router.patch(
  "/:id/reject",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  placementController.rejectPlacement,
);

router.patch(
  "/:id",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  placementController.updatePlacementByCoordinator,
);

router.post(
  "/:id/assign-supervisor",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  placementController.assignIndustrialSupervisor,
);

router.delete(
  "/:id",
  requireRole(ROLES.STUDENT),
  placementController.deletePlacement,
);

module.exports = router;
