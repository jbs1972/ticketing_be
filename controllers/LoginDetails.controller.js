const loginDetailsService = require("../services/LoginDetails.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");

exports.getAllLoginDetails = async (req, res) => {
  try {
    const loginDetails = await loginDetailsService.getAllLoginDetails();
    sendSuccess(res, "Login details fetched successfully", loginDetails, 200);
  } catch (err) {
    sendError(res, "Failed to fetch login details", err, 500);
  }
};

exports.getMyLoginDetails = async (req, res) => {
  try {
    const loginDetails = await loginDetailsService.getLoginDetailsByUser(req.user._id);
    sendSuccess(res, "User login details fetched successfully", loginDetails, 200);
  } catch (err) {
    sendError(res, "Failed to fetch user login details", err, 500);
  }
};
