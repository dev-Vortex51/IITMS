const { getSupervisors } = require("./getSupervisors");
const { getSupervisorById } = require("./getSupervisorById");
const { updateSupervisor } = require("./updateSupervisor");
const { getAvailableSupervisors } = require("./getAvailableSupervisors");
const { assignStudentToSupervisor } = require("./assignStudentToSupervisor");
const { unassignStudentFromSupervisor } = require("./unassignStudentFromSupervisor");
const { getSupervisorDashboard } = require("./getSupervisorDashboard");
const { getSupervisorsByDepartment } = require("./getSupervisorsByDepartment");
const { suggestSupervisors } = require("./suggestSupervisors");

module.exports = {
  getSupervisors,
  getSupervisorById,
  updateSupervisor,
  getAvailableSupervisors,
  suggestSupervisors,
  assignStudentToSupervisor,
  unassignStudentFromSupervisor,
  getSupervisorDashboard,
  getSupervisorsByDepartment,
};
