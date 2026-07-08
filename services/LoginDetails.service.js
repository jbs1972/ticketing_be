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
