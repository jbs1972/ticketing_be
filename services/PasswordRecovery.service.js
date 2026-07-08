const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { User } = require("../models/User.model");
const PasswordForgotOtp = require("../models/PasswordForgotOtp.model");

const OTP_TTL_MINUTES = 10;
const SALT_ROUNDS = 12;

exports.generateOtp = () => crypto.randomInt(100000, 999999).toString();

exports.sendOtpToUser = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User with this email was not found.");
  }

  const otp = this.generateOtp();
  const expiryTime = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await PasswordForgotOtp.deleteMany({ user_id: user._id });

  const otpRecord = new PasswordForgotOtp({
    user_id: user._id,
    otp,
    expiry_time: expiryTime,
  });

  await otpRecord.save();

  return { user, otp, expiryTime };
};

exports.verifyOtp = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User with this email was not found.");
  }

  const otpRecord = await PasswordForgotOtp.findOne({ user_id: user._id }).sort({ createdAt: -1 });
  if (!otpRecord) {
    throw new Error("No OTP found for this user.");
  }

  if (otpRecord.otp !== otp) {
    throw new Error("Invalid OTP.");
  }

  if (new Date() > otpRecord.expiry_time) {
    throw new Error("OTP has expired.");
  }

  return otpRecord;
};

exports.resetPassword = async (email, otp, newPassword) => {
  const otpRecord = await this.verifyOtp(email, otp);
  const user = await User.findById(otpRecord.user_id);

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  await PasswordForgotOtp.deleteMany({ user_id: user._id });

  return user;
};
