const { sendError } = require("../utils/responseFormatter");

// Grants access to Admin only
module.exports = function (req, res, next) {
  if (req.user.role !== "admin") {
    return sendError(res, "Access denied.", null, 403);
  }

  next();
};
