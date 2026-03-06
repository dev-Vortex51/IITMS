const { createUser } = require("./createUser");
const { createStudentProfile } = require("./createStudentProfile");
const { createSupervisorProfile } = require("./createSupervisorProfile");
const { createIndustrialSupervisor } = require("./createIndustrialSupervisor");
const { getUsers } = require("./getUsers");
const { getUserById } = require("./getUserById");
const { updateUser } = require("./updateUser");
const { deleteUser } = require("./deleteUser");

module.exports = {
  createUser,
  createStudentProfile,
  createSupervisorProfile,
  createIndustrialSupervisor,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
