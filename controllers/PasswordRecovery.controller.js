const passwordRecoveryService = require("../services/PasswordRecovery.service");
const mailService = require("../services/mail.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");

exports.sendOtp = async (req, res) => {
  try {
    const { user, otp, expiryTime } =
      await passwordRecoveryService.sendOtpToUser(req.body.email);

    if (!user) {
      return sendError(res, "No account found with this email.", null, 404);
    }

    await mailService.sendMail({
      to: user.email,
      subject: "Password Recovery OTP",
      message: `Hello ${user.name},\n\nYour password recovery OTP is ${otp}. It will expire at ${expiryTime.toLocaleString()}.\n\nThis is a dummy mail template for testing the password recovery flow.`,
    });

    return sendSuccess(
      res,
      "OTP has been sent to your email.",
      { email: req.body.email },
      200,
    );
  } catch (err) {
    return sendError(res, "Failed to send OTP", err, 400);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    await passwordRecoveryService.verifyOtp(req.body.email, req.body.otp);
    return sendSuccess(res, "OTP verified successfully", null, 200);
  } catch (err) {
    return sendError(res, err.message || "OTP verification failed", err, 400);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    await passwordRecoveryService.resetPassword(
      req.body.email,
      req.body.otp,
      req.body.newPassword,
    );
    return sendSuccess(res, "Password reset successfully", null, 200);
  } catch (err) {
    return sendError(res, err.message || "Password reset failed", err, 400);
  }
};
