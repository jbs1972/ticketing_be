const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passwordForgotOtpSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  otp: {
    type: String,
    required: [true, "OTP is required"],
  },
  expiry_time: {
    type: Date,
    required: [true, "Expiry time is required"],
  },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("PasswordForgotOtp", passwordForgotOtpSchema);
