const jwt = require("jsonwebtoken");
const config = require("config");
const loginDetailsService = require("../services/LoginDetails.service");
const { generateFingerprint } = require("../utils/fingerprint");

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

    const session = await loginDetailsService.findActiveSession(
      decoded.sessionId,
    );
    const client = generateFingerprint(req);
    if (session.fingerprint !== client.fingerprint) {
      return res.status(401).json({
        message: "Session validation failed.",

        data: null,

        status: "error",
      });
    }
    
    if (!session) {
      return res.status(401).send("Session expired.");
    }
    await loginDetailsService.updateLastSeen(decoded.sessionId);

    req.user = decoded;

    next();
  } catch (err) {
    console.error("Authentication Error:", err);

    return res.status(401).json({
      message: "Invalid token.",
      data: null,
      status: "error",
    });
  }
};
