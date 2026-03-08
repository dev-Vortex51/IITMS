const express = require("express");
const router = express.Router();
const multer = require("multer");
const { placementController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { cacheResponse } = require("../middleware/cache");
const config = require("../config");
const { ROLES, HTTP_STATUS } = require("../utils/constants");
const { ApiError } = require("../middleware/errorHandler");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = new Set([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);

    if (!allowedTypes.has(file.mimetype)) {
      cb(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Acceptance letter must be a PDF, image, or Word document",
        ),
      );
      return;
    }

    cb(null, true);
  },
});

// All routes require authentication
router.use(authenticate);

router.post(
  "/",
  requireRole(ROLES.STUDENT),
  upload.single("acceptanceLetter"),
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
  upload.single("acceptanceLetter"),
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
