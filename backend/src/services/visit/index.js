const { createVisit } = require("./createVisit");
const { getVisits } = require("./getVisits");
const { getVisitById } = require("./getVisitById");
const { updateVisit } = require("./updateVisit");
const { completeVisit } = require("./completeVisit");
const { cancelVisit } = require("./cancelVisit");
const { getVisitsByStudent } = require("./getVisitsByStudent");

module.exports = {
  createVisit,
  getVisits,
  getVisitById,
  updateVisit,
  completeVisit,
  cancelVisit,
  getVisitsByStudent,
};
