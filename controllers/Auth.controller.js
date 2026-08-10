const Joi = require("joi");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { User } = require("../models/User.model");
const loginDetailsService = require("../services/LoginDetails.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");
const { generateFingerprint } = require("../utils/fingerprint");

// Login
exports.loginUser = async (req, res) => {
  try {
    // Validate Request
    const { error } = validateLogin(req.body);
    if (error) {
      return sendError(res, error.details[0].message, null, 400);
    }

    // Find User
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return sendError(res, "Invalid email or password.", null, 400);
    }

    // Verify Password
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password.", null, 400);
    }

    // Check Account Status
    if (user.isActive === false) {
      return sendError(
        res,
        "Your account has been frozen. Please contact your administrator for assistance.",
        null,
        403,
      );
    }

    // Generate Session Id
    const sessionId = crypto.randomUUID();

    // Invalidate Previous Sessions
    await loginDetailsService.deactivatePreviousSessions(user._id);

    // Generate Fingerprint
    const client = generateFingerprint(req);

    // Create Login Session
    await loginDetailsService.createLoginDetail({
      user_id: user._id,
      session_id: sessionId,
      fingerprint: client.fingerprint,
      socket_id: req.header("x-socket-id") || null,
      login_time: new Date(),
      is_active: true,
    });

    // Generate JWT
    const token = user.getAuthToken(sessionId);

    // Success
    return sendSuccess(res, "Login successful", { token }, 200);
  } catch (err) {
    console.error("Login error:", err);
    return sendError(res, "Failed to login user", err, 500);
  }
};

// Logout
exports.logoutUser = async (req, res) => {
  try {
    const sessionId = req.user?.session_id;

    if (!sessionId) {
      return sendError(res, "Unauthorized", null, 401);
    }

    await loginDetailsService.markLogoutBySession(sessionId);

    return sendSuccess(res, "Logout successful", null, 200);
  } catch (err) {
    console.error("Logout error:", err);
    return sendError(res, "Failed to logout user", err, 500);
  }
};

// Validation
function validateLogin(body) {
  const schema = Joi.object({
    email: Joi.string().trim().email().required().messages({
      "string.email": "Invalid email or password.",
      "string.empty": "Invalid email or password.",
      "any.required": "Invalid email or password.",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Invalid email or password.",
      "any.required": "Invalid email or password.",
    }),
  });

  return schema.validate(body);
}
