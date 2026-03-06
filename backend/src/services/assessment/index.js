const { createAssessment } = require("./createAssessment");
const { getAssessments } = require("./getAssessments");
const { getAssessmentById } = require("./getAssessmentById");
const { updateAssessment } = require("./updateAssessment");
const { submitAssessment } = require("./submitAssessment");
const { verifyAssessment } = require("./verifyAssessment");
const { getStudentFinalGrade } = require("./getStudentFinalGrade");
const { getStudentAssessments } = require("./getStudentAssessments");
const { getSupervisorPendingAssessments } = require("./getSupervisorPendingAssessments");

module.exports = {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  submitAssessment,
  verifyAssessment,
  getStudentFinalGrade,
  getStudentAssessments,
  getSupervisorPendingAssessments,
};
