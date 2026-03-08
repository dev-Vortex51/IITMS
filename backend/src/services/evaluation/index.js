const { createEvaluation } = require("./createEvaluation");
const { getEvaluations } = require("./getEvaluations");
const { getEvaluationById } = require("./getEvaluationById");
const { updateEvaluation } = require("./updateEvaluation");
const { submitEvaluation } = require("./submitEvaluation");
const { completeEvaluation } = require("./completeEvaluation");

module.exports = {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  updateEvaluation,
  submitEvaluation,
  completeEvaluation,
};
