const { uploadToCloudinary } = require("../../utils/cloudinaryUpload");
const { ApiError } = require("../../middleware/errorHandler");
const { HTTP_STATUS } = require("../../utils/constants");

const ACCEPTANCE_LETTER_FOLDER = "iitms/placements/acceptance-letters";

const uploadAcceptanceLetter = async (file) => {
  if (!file) {
    return null;
  }

  try {
    const result = await uploadToCloudinary(file, {
      folder: ACCEPTANCE_LETTER_FOLDER,
    });

    return {
      acceptanceLetter: file.originalname,
      acceptanceLetterPath: result.url,
    };
  } catch (_error) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Acceptance letter upload failed. Please try again.",
    );
  }
};

module.exports = {
  uploadAcceptanceLetter,
};
