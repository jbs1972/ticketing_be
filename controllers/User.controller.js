const userService = require("../services/User.service");
const {
  validateStatus,
  validateRole,
  validateName,
} = require("../models/User.model");
const { sendSuccess, sendError } = require("../utils/responseFormatter");
const _ = require("lodash");
const Joi = require("joi");

const passwordSchema = Joi.string()
  .min(6)
  .max(20)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@])[A-Za-z\d#$@]{6,20}$/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (#, @, or $)",
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password must not exceed 20 characters",
    "any.required": "Password is required",
  });

const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required.",
    "any.required": "Current password is required.",
  }),
  newPassword: passwordSchema,
});

// Register User
exports.registerUser = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body, req.user);

    // registerUser: pass company through in response, add new error branch
    return sendSuccess(
      res,
      "User registered successfully",
      _.pick(user, [
        "_id",
        "name",
        "email",
        "role",
        "company",
        "userCode",
        "registrationDate",
      ]),
      201,
    );
  } catch (err) {
    if (err.message.includes("already registered")) {
      return sendError(res, err.message, null, 400);
    }

    if (err.message.includes("Company is required")) {
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

// getAllUsers: pass requester + optional companyId query through
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers(req.user, req.query.companyId);
    return sendSuccess(res, "Users fetched successfully", users, 200);
  } catch (err) {
    return sendError(res, "Failed to fetch users", err, 500);
  }
};

// Admin: Update User Status
exports.updateUserStatus = async (req, res) => {
  try {
    const { error } = validateStatus(req.body);
    if (error) {
      return sendError(res, error.details[0].message, null, 400);
    }

    const user = await userService.updateUserStatus(
      req.params.id,
      req.body.isActive,
      req.user,
    );

    return sendSuccess(
      res,
      "User status updated successfully",
      _.pick(user, ["_id", "name", "email", "role", "isActive"]),
      200,
    );
  } catch (err) {
    if (
      err.message.includes("cannot alter") ||
      err.message.includes("not found")
    ) {
      return sendError(res, err.message, null, 400);
    }

    return sendError(res, "Failed to update user status", err, 500);
  }
};

// Admin: Update User Role
exports.updateUserRole = async (req, res) => {
  try {
    const { error } = validateRole(req.body);
    if (error) {
      return sendError(res, error.details[0].message, null, 400);
    }

    const user = await userService.updateUserRole(
      req.params.id,
      req.body.role,
      req.user,
    );

    return sendSuccess(
      res,
      "User role updated successfully",
      _.pick(user, ["_id", "name", "email", "role", "isActive"]),
      200,
    );
  } catch (err) {
    if (
      err.message.includes("cannot alter") ||
      err.message.includes("not found")
    ) {
      return sendError(res, err.message, null, 400);
    }

    return sendError(res, "Failed to update user role", err, 500);
  }
};

// Admin: Update User Name
exports.updateUserName = async (req, res) => {
  try {
    const { error } = validateName(req.body);
    if (error) {
      return sendError(res, error.details[0].message, null, 400);
    }

    const user = await userService.updateUserName(
      req.params.id,
      req.body.name,
      req.user,
    );

    return sendSuccess(
      res,
      "User name updated successfully",
      _.pick(user, ["_id", "name", "email", "role", "isActive"]),
      200,
    );
  } catch (err) {
    if (
      err.message.includes("cannot alter") ||
      err.message.includes("not found")
    ) {
      return sendError(res, err.message, null, 400);
    }

    return sendError(res, "Failed to update user name", err, 500);
  }
};

// Admin: Delete User
exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id, req.user);
    return sendSuccess(res, "User deleted successfully", null, 200);
  } catch (err) {
    if (
      err.message.includes("cannot alter") ||
      err.message.includes("not found")
    ) {
      return sendError(res, err.message, null, 400);
    }

    return sendError(res, "Failed to delete user", err, 500);
  }
};

exports.getMentionableUsers = async (req, res) => {
  try {
    const users = await userService.getMentionableUsers();
    return sendSuccess(
      res,
      "Mentionable users fetched successfully",
      users,
      200,
    );
  } catch (err) {
    return sendError(res, "Failed to fetch mentionable users", err, 500);
  }
};

// Current user changes their own password
exports.changeOwnPassword = async (req, res) => {
  try {
    const { error } = passwordChangeSchema.validate(req.body);
    if (error) {
      return sendError(res, error.details[0].message, null, 400);
    }

    await userService.changeOwnPassword(
      req.user._id,
      req.body.currentPassword,
      req.body.newPassword,
    );

    return sendSuccess(res, "Password changed successfully", null, 200);
  } catch (err) {
    if (
      err.message.includes("not found") ||
      err.message.includes("incorrect")
    ) {
      return sendError(res, err.message, null, 400);
    }

    return sendError(res, "Failed to change password", err, 500);
  }
};
