/**
 * Services Export
 * Central export point for all service modules
 */

const authService = require("./authService");
const userService = require("./userService");
const notificationService = require("./notificationService");
const studentService = require("./studentService");
const facultyService = require("./facultyService");
const departmentService = require("./departmentService");
const placementService = require("./placementService");
const logbookService = require("./logbookService");
const assessmentService = require("./assessmentService");
const supervisorService = require("./supervisorService");
const reportService = require("./reportService");

module.exports = {
  authService,
  userService,
  notificationService,
  studentService,
  facultyService,
  departmentService,
  placementService,
  logbookService,
  assessmentService,
  supervisorService,
  reportService,
};
