const express = require("express");
const multer = require("multer");
const router = express.Router();
const technicalReportController = require("../controllers/technicalReportController");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { validateBody } = require("../middleware/validation");
const { ROLES, HTTP_STATUS } = require("../utils/constants");
const { ApiError } = require("../middleware/errorHandler");
const { technicalReportValidation } = require("../utils/validators");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);

    if (!allowedTypes.has(file.mimetype)) {
      cb(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Final technical report must be a PDF or Word document",
        ),
      );
      return;
    }

    cb(null, true);
  },
});

router.use(authenticate);

router.post(
  "/",
  requireRole(ROLES.STUDENT),
  upload.single("document"),
  validateBody(technicalReportValidation.createTechnicalReport),
  technicalReportController.createTechnicalReport,
);

router.get(
  "/",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  technicalReportController.getTechnicalReports,
);

router.get(
  "/:id",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  technicalReportController.getTechnicalReportById,
);

router.put(
  "/:id",
  requireRole(ROLES.STUDENT),
  upload.single("document"),
  validateBody(technicalReportValidation.updateTechnicalReport),
  technicalReportController.updateTechnicalReport,
);

router.post(
  "/:id/submit",
  requireRole(ROLES.STUDENT),
  validateBody(technicalReportValidation.submitTechnicalReport),
  technicalReportController.submitTechnicalReport,
);

router.post(
  "/:id/review",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  validateBody(technicalReportValidation.reviewTechnicalReport),
  technicalReportController.reviewTechnicalReport,
);

module.exports = router;
