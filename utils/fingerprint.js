const crypto = require("crypto");

// Browse
function getBrowser(userAgent = "") {
  if (userAgent.includes("Postman")) return "Postman";

  if (userAgent.includes("Edg")) return "Microsoft Edge";

  if (userAgent.includes("Chrome")) return "Google Chrome";

  if (userAgent.includes("Firefox")) return "Mozilla Firefox";

  if (userAgent.includes("Safari")) return "Safari";

  return "Unknown Browser";
}

// Operating System
function getOperatingSystem(userAgent = "") {
  if (userAgent.includes("Windows")) return "Windows";

  if (userAgent.includes("Mac")) return "macOS";

  if (userAgent.includes("Linux")) return "Linux";

  if (userAgent.includes("Android")) return "Android";

  if (userAgent.includes("iPhone")) return "iOS";

  return "Unknown OS";
}

// Generate Fingerprint
function generateFingerprint(req) {
  const userAgent = req.headers["user-agent"] || "";

  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const browser = getBrowser(userAgent);

  const operatingSystem = getOperatingSystem(userAgent);

  const deviceName = userAgent;

  const fingerprint = crypto
    .createHash("sha256")
    .update(userAgent + ipAddress)
    .digest("hex");

  return {
    browser,

    operatingSystem,

    deviceName,

    ipAddress,

    fingerprint,
  };
}

module.exports = {
  generateFingerprint,
};
