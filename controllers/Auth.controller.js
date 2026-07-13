const Joi = require("joi");
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
    // Invalidate Previous Sessions
    await loginDetailsService.deactivatePreviousSessions(user._id);

    // Generate Client Information
    const client = generateFingerprint(req);

    // Create Login Session
    const loginRecord = await loginDetailsService.createLoginDetail({
      user_id: user._id,
      login_time: new Date(),
      is_active: true,
	  ip_address: client.ipAddress,

      browser: client.browser,

      operating_system: client.operatingSystem,

      device_name: client.deviceName,

      fingerprint: client.fingerprint							   
    });

	// Generate JWT
    const token = user.getAuthToken(loginRecord._id);
	// When Success
    return sendSuccess(res, "Login successful", { token }, 200);
  } catch (err) {
    console.error("Login error", err);
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
    console.error("Logout error", err);
    return sendError(res, "Failed to logout user", err, 500);
  }
};

// Validation
function validateLogin(body) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
  });

  return schema.validate(body);
}
