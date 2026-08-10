const jwt = require("jsonwebtoken");
const config = require("config");
const loginDetailsService = require("../services/LoginDetails.service");
const { User } = require("../models/User.model");
const { sendError } = require("../utils/responseFormatter");
const { generateFingerprint } = require("../utils/fingerprint");

module.exports = async function (req, res, next) {
  // Read Token
  const token = req.header("x-auth-token");

  if (!token) {
    return sendError(res, "Access denied. No token provided.", null, 401);
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

    req.user = decoded;

    // Read Session Id
    const sessionId = decoded.session_id;

    if (!sessionId) {
      return sendError(
        res,
        "Session information missing. Please login again.",
        null,
        401,
      );
    }

    // Get Active Session
    const session = await loginDetailsService.getActiveSession(sessionId);

    if (!session) {
      const user = await User.findById(decoded._id).select("isActive");

      if (user && user.isActive === false) {
        return sendError(
          res,
          "Your account has been frozen. Please contact your administrator for assistance.",
          null,
          403,
        );
      }

      return sendError(res, "Session expired. Please login again.", null, 401);
    }

    // Validate Fingerprint
    const client = generateFingerprint(req);

    if (session.fingerprint && session.fingerprint !== client.fingerprint) {
      return sendError(res, "Session validation failed.", null, 401);
    }

    // Refresh Socket Id
    const socketId = req.header("x-socket-id");

    if (socketId && session.socket_id !== socketId) {
      await loginDetailsService.updateSocketId(sessionId, socketId);
    }

    next();
  } catch (err) {
    console.error("Authentication Error:", err);

    return sendError(res, "Invalid token.", err, 400);
  }
};
