const rateLimit = require("express-rate-limit");

// Store to track failed attempts per IP
const failedAttemptsStore = new Map();

// Configuration for rate limiting
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of failedAttemptsStore.entries()) {
    if (now - data.resetTime > RATE_LIMIT_WINDOW) {
      failedAttemptsStore.delete(ip);
    }
  }
}, 60 * 60 * 1000);

/**
 * Custom rate limiter middleware that only counts FAILED attempts
 * Allows unlimited successful requests
 */
const failureBasedLimiter = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;

  // Initialize or get existing entry for this IP
  if (!failedAttemptsStore.has(clientIp)) {
    failedAttemptsStore.set(clientIp, {
      failedAttempts: 0,
      resetTime: Date.now(),
    });
  }

  const ipData = failedAttemptsStore.get(clientIp);
  const now = Date.now();

  // Reset if window has expired
  if (now - ipData.resetTime > RATE_LIMIT_WINDOW) {
    ipData.failedAttempts = 0;
    ipData.resetTime = now;
  }

  // Check if IP has exceeded failed attempt limit
  if (ipData.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    return res.status(429).json({
      message: "Too many failed attempts. Please try again later.",
      data: null,
      status: 429,
    });
  }

  // Wrap the send method to track failed responses
  const originalSend = res.json.bind(res);

  res.json = function (body) {
    // Only increment failure counter for error responses (status >= 400)
    if (res.statusCode >= 400 && res.statusCode !== 429) {
      ipData.failedAttempts++;
    }

    return originalSend(body);
  };

  next();
};

/**
 * Traditional rate limiter for rate-limited endpoints
 * Applied on top of failure-based limiter for additional protection
 */
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: 20, // Total requests limit
  message: {
    message: "Too many requests. Please try again later.",
    data: null,
    status: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  failureBasedLimiter,
  authLimiter,
};
