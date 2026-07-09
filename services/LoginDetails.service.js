const LoginDetail = require("../models/LoginDetails.model");

exports.createLoginDetail = async ({
  user_id,
  session_id,
  ip_address,
  browser,
  operating_system,
  device_name,
  fingerprint,
  login_time,
  logout_time,
  is_active,
}) => {
  const loginDetail = new LoginDetail({
    user_id,
    session_id,
    login_time: login_time || Date.now(),
    logout_time,
    is_active: typeof is_active === "boolean" ? is_active : true,
    ip_address,
    browser,
    operating_system,
    device_name,
    fingerprint,
  });

  return await loginDetail.save();
};

exports.getAllLoginDetails = async () => {
  return await LoginDetail.find()
    .populate("user_id", "name email")
    .sort({ login_time: -1 });
};

exports.getLoginDetailsByUser = async (userId) => {
  return await LoginDetail.find({ user_id: userId })
    .populate("user_id", "name email")
    .sort({ login_time: -1 });
};

exports.deactivatePreviousSessions = async (userId) => {
  await LoginDetail.updateMany(
    {
      user_id: userId,
      is_active: true,
    },
    {
      $set: {
        is_active: false,
        logout_time: new Date(),
        logout_reason: "New Login",
      },
    },
  );
};

exports.findActiveSession = async (sessionId) => {
  return await LoginDetail.findOne({
    session_id: sessionId,
    is_active: true,
  });
};

exports.updateLastSeen = async (sessionId) => {
  await LoginDetail.updateOne(
    {
      session_id: sessionId,
    },
    {
      last_seen: new Date(),
    },
  );
};
