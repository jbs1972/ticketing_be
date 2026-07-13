const LoginDetail = require("../models/LoginDetails.model");

exports.createLoginDetail = async ({ user_id, login_time, logout_time,
  ip_address,
  browser,
  operating_system,
  device_name,
  fingerprint, }) => {
  const loginDetail = new LoginDetail({
    user_id,
    login_time: login_time || Date.now(),
    logout_time,
    ip_address,

    browser,

    operating_system,

    device_name,

    fingerprint,
  });

  return await loginDetail.save();
};

// Fetch All Login Details
exports.getAllLoginDetails = async () => {
  return await LoginDetail.find()
    .populate("user_id", "name email")
    .sort({ login_time: -1 });
};

// Fetch Login Details By User
exports.getLoginDetailsByUser = async (userId) => {
  return await LoginDetail.find({ user_id: userId })
    .populate("user_id", "name email")
    .sort({ login_time: -1 });
};

// Deactivate Previous Sessions
exports.deactivatePreviousSessions = async (userId) => {
  return await LoginDetail.updateMany(
    {
      user_id: userId
    },

    {
      $set: {

        logout_time: new Date(),

        logout_reason: "New Login",
      },
    },
  );
};

// Get Active Session
exports.getActiveSession = async (sessionId) => {
  if (!sessionId) return null;

  return await LoginDetail.findOne({
    _id: sessionId
  });
};

// Check Session Active
exports.isSessionActive = async (sessionId) => {
  if (!sessionId) return false;

  const session = await LoginDetail.findOne({
    _id: sessionId,
  });

  return !!session;
};

// Logout Current Session
exports.markLogoutForUser = async (userId) => {
  // Find the most recent active login detail for this user and mark it logged out
  return await LoginDetail.findOneAndUpdate(
    { user_id: userId },
    { $set: { logout_time: Date.now() } },
    { sort: { login_time: -1 }, new: true }
  );
};

exports.isUserSessionActive = async (userId) => {
  const active = await LoginDetail.findOne({ user_id: userId, is_active: true }).sort({ login_time: -1 });
  return !!active;
};

exports.markLogoutBySession = async (sessionId) => {
  return await LoginDetail.findOneAndUpdate(
    { _id: sessionId },
    { $set: { logout_time: Date.now() } },
    { new: true }
  );
};
};
