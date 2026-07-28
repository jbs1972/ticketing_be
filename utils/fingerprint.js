const crypto = require("crypto");

// Generate Fingerprint
function generateFingerprint(req) {
  const userAgent = req.headers["user-agent"] || "";

  const fingerprint = crypto
    .createHash("sha256")
    .update(userAgent)
    .digest("hex");

  return {
    fingerprint,
  };
}

module.exports = {
  generateFingerprint,
};
