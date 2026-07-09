const Joi = require("joi");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { User } = require("../models/User.model");
const loginDetailsService = require("../services/LoginDetails.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");
const { generateFingerprint } = require("../utils/fingerprint");

exports.loginUser = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return sendError(res, error.details[0].message, null, 400);
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return sendError(res, "Invalid email or password.", null, 400);
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password.", null, 400);
    }

    await loginDetailsService.deactivatePreviousSessions(user._id);

    const sessionId = crypto.randomUUID();

    const client = generateFingerprint(req);

    await loginDetailsService.createLoginDetail({
      user_id: user._id,
      session_id: sessionId,
      ip_address: client.ipAddress,
      browser: client.browser,
      operating_system: client.operatingSystem,
      device_name: client.deviceName,
      fingerprint: client.fingerprint,
      login_time: new Date(),
      is_active: true,
    });

    const token = user.getAuthToken(sessionId);
    return sendSuccess(res, "Login successful", { token }, 200);
  } catch (err) {
    console.error("Login error", err);
    return sendError(res, "Failed to login user", err, 500);
  }
};

function validateLogin(body) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
  });

  return schema.validate(body);
}
