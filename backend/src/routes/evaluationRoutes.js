const express = require("express");
const router = express.Router();
const evaluationController = require("../controllers/evaluationController");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { validateBody } = require("../middleware/validation");
const { ROLES } = require("../utils/constants");
const { evaluationValidation } = require("../utils/validators");

router.use(authenticate);

router.post(
  "/",
  requireRole(ROLES.ACADEMIC_SUPERVISOR),
  validateBody(evaluationValidation.createEvaluation),
  evaluationController.createEvaluation,
);

router.get(
  "/",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR),
  evaluationController.getEvaluations,
);

router.get(
  "/:id",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR),
  evaluationController.getEvaluationById,
);

router.put(
  "/:id",
  requireRole(ROLES.ACADEMIC_SUPERVISOR),
  validateBody(evaluationValidation.updateEvaluation),
  evaluationController.updateEvaluation,
);

router.post(
  "/:id/submit",
  requireRole(ROLES.ACADEMIC_SUPERVISOR),
  evaluationController.submitEvaluation,
);

router.post(
  "/:id/complete",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR),
  evaluationController.completeEvaluation,
);

module.exports = router;
