const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS, PLACEMENT_STATUS } = require("../../utils/constants");
const { reviewPlacement } = require("./reviewPlacement");

const approvePlacement = async (placementId, remarks, reviewerId) => {
  return await reviewPlacement(
    placementId,
    {
      status: PLACEMENT_STATUS.APPROVED,
      reviewComment: remarks,
    },
    reviewerId,
  );
};

const rejectPlacement = async (placementId, remarks, reviewerId) => {
  if (!remarks) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Remarks are required when rejecting a placement",
    );
  }

  return await reviewPlacement(
    placementId,
    {
      status: PLACEMENT_STATUS.REJECTED,
      reviewComment: remarks,
    },
    reviewerId,
  );
};

module.exports = {
  approvePlacement,
  rejectPlacement,
};
