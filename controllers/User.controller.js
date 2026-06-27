const userService = require("../services/User.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");
const _ = require("lodash");

exports.registerUser = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    const token = user.getAuthToken();

    res
      .header("x-auth-token", token)
      .json({
        message: "User registered successfully",
        data: _.pick(user, ["_id", "name", "email"]),
        status: "success",
      });
  } catch (err) {
    if (err.message.includes("already registered")) {
      return sendError(res, err.message, null, 400);
    }
    sendError(res, "Failed to register user", err, 500);
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user._id);
    sendSuccess(res, "User fetched successfully", user, 200);
  } catch (err) {
    sendError(res, "Failed to fetch user", err, 500);
  }
};
