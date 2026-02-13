const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const {
  adminOrCoordinator,
  adminOnly,
  ownerOrAdmin,
} = require("../middleware/authorization");
const { validateBody, validateObjectId } = require("../middleware/validation");
const { userValidation } = require("../utils/validators");

router.post(
  "/",
  authenticate,
  adminOrCoordinator,
  validateBody(userValidation.createUser),
  userController.createUser,
);

router.get("/", authenticate, adminOrCoordinator, userController.getUsers);

router.get(
  "/:id",
  authenticate,
  validateObjectId("id"),
  userController.getUserById,
);

router.put(
  "/:id",
  authenticate,
  adminOrCoordinator,
  validateObjectId("id"),
  validateBody(userValidation.updateUser),
  userController.updateUser,
);

router.delete(
  "/:id",
  authenticate,
  adminOnly,
  validateObjectId("id"),
  userController.deleteUser,
);

router.post(
  "/industrial-supervisor",
  authenticate,
  adminOrCoordinator,
  userController.createIndustrialSupervisor,
);

module.exports = router;
