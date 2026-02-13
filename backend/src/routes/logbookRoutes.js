const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { logbookController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/logbooks/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and documents are allowed"));
    }
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
