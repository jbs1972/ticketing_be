const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const loginDetailsSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
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
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("LoginDetail", loginDetailsSchema);