const LoginDetail = require("../models/LoginDetails.model");

exports.createLoginDetail = async ({ user_id, login_time, logout_time, is_active }) => {
  const loginDetail = new LoginDetail({
    user_id,
    login_time: login_time || Date.now(),
    logout_time,
    is_active: typeof is_active === "boolean" ? is_active : true,
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

exports.markLogoutForUser = async (userId) => {
  // Find the most recent active login detail for this user and mark it logged out
  return await LoginDetail.findOneAndUpdate(
    { user_id: userId, is_active: true },
    { $set: { logout_time: Date.now(), is_active: false } },
    { sort: { login_time: -1 }, new: true }
  );
};

exports.isUserSessionActive = async (userId) => {
  const active = await LoginDetail.findOne({ user_id: userId, is_active: true }).sort({ login_time: -1 });
  return !!active;
};

exports.markLogoutBySession = async (sessionId) => {
  return await LoginDetail.findOneAndUpdate(
    { _id: sessionId, is_active: true },
    { $set: { logout_time: Date.now(), is_active: false } },
    { new: true }
  );
};

exports.isSessionActive = async (sessionId) => {
  if (!sessionId) return false;
  const rec = await LoginDetail.findOne({ _id: sessionId, is_active: true });
  return !!rec;
};
