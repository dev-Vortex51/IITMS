/**
 * Logbook Routes
 * API routes for logbook management
 */

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
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
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
      path.extname(file.originalname).toLowerCase()
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

/**
 * @route   POST /api/v1/logbooks
 * @desc    Create logbook entry
 * @access  Student
 */
router.post(
  "/",
  requireRole(ROLES.STUDENT),
  upload.array("evidence", 5), // Allow up to 5 files
  logbookController.createLogbookEntry
);

/**
 * @route   GET /api/v1/logbooks
 * @desc    Get all logbooks
 * @access  Authenticated users
 */
router.get("/", logbookController.getLogbooks);

/**
 * @route   GET /api/v1/logbooks/pending-review
 * @desc    Get pending logbooks for supervisor
 * @access  Supervisor
 */
router.get(
  "/pending-review",
  requireRole(ROLES.ACADEMIC_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR),
  logbookController.getLogbooksPendingReview
);

/**
 * @route   GET /api/v1/logbooks/:id
 * @desc    Get logbook by ID
 * @access  Authenticated users
 */
router.get("/:id", logbookController.getLogbookById);

/**
 * @route   PUT /api/v1/logbooks/:id
 * @desc    Update logbook entry
 * @access  Student (owner)
 */
router.put(
  "/:id",
  requireRole(ROLES.STUDENT),
  upload.array("evidence", 5), // Allow up to 5 files
  logbookController.updateLogbookEntry
);

/**
 * @route   POST /api/v1/logbooks/:id/submit
 * @desc    Submit logbook entry
 * @access  Student (owner)
 */
router.post(
  "/:id/submit",
  requireRole(ROLES.STUDENT),
  logbookController.submitLogbookEntry
);

/**
 * @route   POST /api/v1/logbooks/:id/review
 * @desc    Review logbook (Departmental Supervisor)
 * @access  Departmental Supervisor
 */
router.post(
  "/:id/review",
  requireRole(ROLES.ACADEMIC_SUPERVISOR),
  logbookController.reviewLogbook
);

/**
 * @route   POST /api/v1/logbooks/:id/industrial-review
 * @desc    Review logbook (Industrial Supervisor)
 * @access  Industrial Supervisor
 */
router.post(
  "/:id/industrial-review",
  requireRole(ROLES.INDUSTRIAL_SUPERVISOR),
  logbookController.industrialReviewLogbook
);

module.exports = router;
