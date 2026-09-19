const { sendError } = require("../utils/responseFormatter");

// Grants access to Super Admin only
module.exports = function (req, res, next) {
  if (req.user.role !== "superadmin") {
    return sendError(res, "Access denied.", null, 403);
  }

  next();
};
