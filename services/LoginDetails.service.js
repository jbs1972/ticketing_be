const LoginDetail = require("../models/LoginDetails.model");

// Create Login Detail
exports.createLoginDetail = async ({
  user_id,
  session_id,
  ip_address,
  browser,
  operating_system,
  device_name,
  fingerprint,
  socket_id,
  login_time,
  logout_time,
  is_active,
}) => {
  const loginDetail = new LoginDetail({
    user_id,
    session_id,
    ip_address,
    browser,
    operating_system,
    device_name,
    fingerprint,
    socket_id,
    login_time: login_time || Date.now(),
    logout_time,
    is_active: typeof is_active === "boolean" ? is_active : true,
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
exports.deactivatePreviousSessions = async (userId, reason = "New Login") => {
  return await LoginDetail.updateMany(
    {
      user_id: userId,
      is_active: true,
    },
    {
      $set: {
        is_active: false,
        logout_time: new Date(),
        logout_reason: reason,
      },
    },
  );
};

// Get Active Session
exports.getActiveSession = async (sessionId) => {
  return await LoginDetail.findOne({
    session_id: sessionId,
    is_active: true,
  });
};

// Get Active Sessions By User
exports.getActiveSessionsByUser = async (userId) => {
  return await LoginDetail.find({
    user_id: userId,
    is_active: true,
  });
};

// Update Socket Id
exports.updateSocketId = async (sessionId, socketId) => {
  return await LoginDetail.findOneAndUpdate(
    {
      session_id: sessionId,
      is_active: true,
    },
    {
      $set: { socket_id: socketId },
    },
  );
};

// Mark Logout By Session
exports.markLogoutBySession = async (sessionId) => {
  return await LoginDetail.findOneAndUpdate(
    {
      session_id: sessionId,
      is_active: true,
    },
    {
      $set: {
        logout_time: new Date(),
        is_active: false,
        logout_reason: "Manual Logout",
      },
    },
    {
      returnDocument: "after",
    },
  );
};
