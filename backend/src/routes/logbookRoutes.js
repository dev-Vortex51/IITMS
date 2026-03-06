const express = require("express");
const router = express.Router();
const multer = require("multer");
const { logbookController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error("Only images and documents are allowed"));
  },
});

// All routes require authentication
router.use(authenticate);

router.post(
  "/",
  requireRole(ROLES.STUDENT),
  upload.array("evidence", 5), // Allow up to 5 files
  logbookController.createLogbookEntry,
);

router.get("/", logbookController.getLogbooks);

router.get(
  "/pending-review",
  requireRole(ROLES.ACADEMIC_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR),
  logbookController.getLogbooksPendingReview,
);

router.get("/:id", logbookController.getLogbookById);

router.put(
  "/:id",
  requireRole(ROLES.STUDENT),
  upload.array("evidence", 5), // Allow up to 5 files
  logbookController.updateLogbookEntry,
);

router.post(
  "/:id/submit",
  requireRole(ROLES.STUDENT),
  logbookController.submitLogbookEntry,
);

router.post(
  "/:id/review",
  requireRole(ROLES.ACADEMIC_SUPERVISOR),
  logbookController.reviewLogbook,
);

router.post(
  "/:id/industrial-review",
  requireRole(ROLES.INDUSTRIAL_SUPERVISOR),
  logbookController.industrialReviewLogbook,
);

module.exports = router;
