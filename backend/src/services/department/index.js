const { createDepartment } = require("./createDepartment");
const { getDepartments } = require("./getDepartments");
const { getDepartmentById } = require("./getDepartmentById");
const { updateDepartment } = require("./updateDepartment");
const { deleteDepartment } = require("./deleteDepartment");
const { toggleDepartmentStatus } = require("./toggleDepartmentStatus");
const { hardDeleteDepartment } = require("./hardDeleteDepartment");
const { getDepartmentsByFaculty } = require("./getDepartmentsByFaculty");
const { getDepartmentStats } = require("./getDepartmentStats");
const { assignCoordinator } = require("./assignCoordinator");
const { getCoordinatorsForDepartment } = require("./getCoordinatorsForDepartment");

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
  hardDeleteDepartment,
  getDepartmentsByFaculty,
  getDepartmentStats,
  assignCoordinator,
  getCoordinatorsForDepartment,
};
