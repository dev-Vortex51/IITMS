const express = require("express");
const router = express.Router();
const visitController = require("../controllers/visitController");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorization");
const { validateBody } = require("../middleware/validation");
const { ROLES } = require("../utils/constants");
const { visitValidation } = require("../utils/validators");

router.use(authenticate);

router.post(
  "/",
  requireRole(ROLES.ACADEMIC_SUPERVISOR),
  validateBody(visitValidation.createVisit),
  visitController.createVisit,
);

router.get(
  "/",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR),
  visitController.getVisits,
);

router.get(
  "/:id",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR),
  visitController.getVisitById,
);

router.put(
  "/:id",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR),
  validateBody(visitValidation.updateVisit),
  visitController.updateVisit,
);

router.post(
  "/:id/complete",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR),
  validateBody(visitValidation.completeVisit),
  visitController.completeVisit,
);

router.post(
  "/:id/cancel",
  requireRole(ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ACADEMIC_SUPERVISOR),
  validateBody(visitValidation.cancelVisit),
  visitController.cancelVisit,
);

module.exports = router;
