const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const loginDetailsSchema = new Schema({
// User Information
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
// Client Information
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

// Session Information
  login_time: {
    type: Date,
    required: [true, "Login time is required"],
    default: Date.now,
  },
  logout_time: {
    type: Date,
	default: null,
  }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("LoginDetail", loginDetailsSchema);