const userService = require("../services/User.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");
const _ = require("lodash");

// Register User
exports.registerUser = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);

    return sendSuccess(
      res,
      "User registered successfully",
      _.pick(user, ["_id", "name", "email", "isAdmin"]),
      201,
    );
  } catch (err) {
    if (err.message.includes("already registered")) {
      return sendError(res, err.message, null, 400);
    }

    return sendError(res, "Failed to register user", err, 500);
  }
};

// Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user._id);

    return sendSuccess(res, "User fetched successfully", user, 200);
  } catch (err) {
    return sendError(res, "Failed to fetch user", err, 500);
  }
};

// Admin: Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    return sendSuccess(res, "Users fetched successfully", users, 200);
  } catch (err) {
    return sendError(res, "Failed to fetch users", err, 500);
  }
};
