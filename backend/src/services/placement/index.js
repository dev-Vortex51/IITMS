const { createPlacement } = require("./createPlacement");
const { getPlacements } = require("./getPlacements");
const { getPlacementById } = require("./getPlacementById");
const { updatePlacement } = require("./updatePlacement");
const { reviewPlacement } = require("./reviewPlacement");
const { assignIndustrialSupervisor } = require("./assignIndustrialSupervisor");
const { approvePlacement, rejectPlacement } = require("./approveRejectPlacement");
const { withdrawPlacement } = require("./withdrawPlacement");
const { deletePlacement } = require("./deletePlacement");
const { updatePlacementByCoordinator } = require("./updatePlacementByCoordinator");
const { getStudentPlacement } = require("./getStudentPlacement");

module.exports = {
  createPlacement,
  getPlacements,
  getPlacementById,
  updatePlacement,
  withdrawPlacement,
  reviewPlacement,
  approvePlacement,
  rejectPlacement,
  assignIndustrialSupervisor,
  updatePlacementByCoordinator,
  deletePlacement,
  getStudentPlacement,
};
