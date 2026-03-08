const express = require("express");
const multer = require("multer");
const router = express.Router();
const complianceFormController = require("../controllers/complianceFormController");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { validateBody } = require("../middleware/validation");
const { ROLES, HTTP_STATUS } = require("../utils/constants");
const { ApiError } = require("../middleware/errorHandler");
const { complianceFormValidation } = require("../utils/validators");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
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
          "Compliance form must be a PDF, image, or Word document",
        ),
      );
      return;
    }

    cb(null, true);
  },
});

router.use(authenticate);

router.get(
  "/template",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  complianceFormController.getComplianceRegistryTemplate,
);

router.post(
  "/",
  requireRole(ROLES.STUDENT),
  upload.single("document"),
  validateBody(complianceFormValidation.createComplianceForm),
  complianceFormController.createComplianceForm,
);

router.get(
  "/",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  complianceFormController.getComplianceForms,
);

router.get(
  "/:id",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.STUDENT),
  complianceFormController.getComplianceFormById,
);

router.put(
  "/:id",
  requireRole(ROLES.STUDENT),
  upload.single("document"),
  validateBody(complianceFormValidation.updateComplianceForm),
  complianceFormController.updateComplianceForm,
);

router.post(
  "/:id/submit",
  requireRole(ROLES.STUDENT),
  validateBody(complianceFormValidation.submitComplianceForm),
  complianceFormController.submitComplianceForm,
);

router.post(
  "/:id/review",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  validateBody(complianceFormValidation.reviewComplianceForm),
  complianceFormController.reviewComplianceForm,
);

module.exports = router;
