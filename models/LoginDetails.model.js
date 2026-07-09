const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const loginDetailsSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    session_id: {
      type: String,
      required: [true, "Session ID is required"],
      unique: true,
    },
    ip_address: {
      type: String,
      default: null,
    },

    browser: {
      type: String,
      default: null,
    },

    operating_system: {
      type: String,
      default: null,
    },

    device_name: {
      type: String,
      default: null,
    },

    fingerprint: {
      type: String,
      default: null,
    },
    login_time: {
      type: Date,
      required: [true, "Login time is required"],
      default: Date.now,
    },
    logout_time: {
      type: Date,
    },
    is_active: {
      type: Boolean,
      required: [true, "Active status is required"],
      default: true,
    },
    last_seen: {
      type: Date,
      default: Date.now,
    },
    logout_reason: {
      type: String,
      enum: [
        "Manual Logout",
        "New Login",
        "Session Expired",
        "Admin Logout",
        "Unknown",
      ],
      default: "Unknown",
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("LoginDetail", loginDetailsSchema);
