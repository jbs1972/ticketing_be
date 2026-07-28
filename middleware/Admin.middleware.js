const { sendError } = require("../utils/responseFormatter");

module.exports = function (req, res, next) {
  // 403 Forbidden
  if (!req.user.isAdmin) {
    return sendError(res, "Access denied.", null, 403);
  }

  next();
};
