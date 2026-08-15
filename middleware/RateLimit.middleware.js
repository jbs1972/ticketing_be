const rateLimit = require("express-rate-limit");

const failedAttemptsStore = new Map();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of failedAttemptsStore.entries()) {
    if (now - data.resetTime > RATE_LIMIT_WINDOW) {
      failedAttemptsStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

const failureBasedLimiter = (req, res, next) => {
  const identifier = req.body?.email || req.body?.username;

  if (!identifier) {
    return next();
  }

  if (!failedAttemptsStore.has(identifier)) {
    failedAttemptsStore.set(identifier, {
      failedAttempts: 0,
      resetTime: Date.now(),
    });
  }

  const userData = failedAttemptsStore.get(identifier);
  const now = Date.now();

  if (now - userData.resetTime > RATE_LIMIT_WINDOW) {
    userData.failedAttempts = 0;
    userData.resetTime = now;
  }

  if (userData.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    return res.status(429).json({
      message: "Too many failed attempts. Please try again later.",
      data: null,
      status: 429,
    });
  }

  const originalSend = res.json.bind(res);

  res.json = function (body) {
    if (res.statusCode >= 400 && res.statusCode !== 429) {
      userData.failedAttempts++;
    } else if (res.statusCode < 400) {
      userData.failedAttempts = 0;
    }

    return originalSend(body);
  };

  next();
};

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: 20,
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