const calculateAverageScore = (scores) => {
  const values = [
    scores.technicalSkill,
    scores.communication,
    scores.professionalism,
    scores.punctuality,
    scores.problemSolving,
    scores.workAttitude,
    scores.initiative,
  ].filter((value) => Number.isFinite(value));

  if (!values.length) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 100) / 100;
};

const calculateGrade = (score) => {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
};

module.exports = {
  calculateAverageScore,
  calculateGrade,
};
