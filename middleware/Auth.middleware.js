const jwt = require("jsonwebtoken");
const config = require("config");
const loginDetailsService = require("../services/LoginDetails.service");
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
      return sendError(res, "Session expired. Please login again.", null, 401);
    }

    // Validate Fingerprint
    const client = generateFingerprint(req);

    if (session.fingerprint && session.fingerprint !== client.fingerprint) {
      return sendError(res, "Session validation failed.", null, 401);
    }

    next();
  } catch (err) {
    console.error("Authentication Error:", err);

    return sendError(res, "Invalid token.", err, 400);
  }
};
