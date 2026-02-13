const express = require("express");
const router = express.Router();
const { assessmentController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { ROLES } = require("../utils/constants");

// All routes require authentication
router.use(authenticate);

router.post(
  "/",
  requireRole(ROLES.ACADEMIC_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR),
  assessmentController.createAssessment,
);

router.get("/", assessmentController.getAssessments);

router.get(
  "/pending",
  requireRole(ROLES.ACADEMIC_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR),
  assessmentController.getSupervisorPendingAssessments,
);

router.get("/:id", assessmentController.getAssessmentById);

router.put(
  "/:id",
  requireRole(ROLES.ACADEMIC_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR),
  assessmentController.updateAssessment,
);

router.post(
  "/:id/submit",
  requireRole(ROLES.ACADEMIC_SUPERVISOR, ROLES.INDUSTRIAL_SUPERVISOR),
  assessmentController.submitAssessment,
);

router.post(
  "/:id/verify",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR),
  assessmentController.verifyAssessment,
);

module.exports = router;
