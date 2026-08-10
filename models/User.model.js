const config = require("config");
const jwt = require("jsonwebtoken");

const Joi = require("joi");
const mongoose = require("mongoose");

// Password Validation Schema
const passwordSchema = Joi.string()
  .min(6)
  .max(20)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@])[A-Za-z\d#$@]{6,20}$/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (#, @, or $)",
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password must not exceed 20 characters",
    "any.required": "Password is required",
  });

const ROLES = ["admin", "user"];

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024, // Allow longer passwords for bcrypt hashes
  },
  role: {
    type: String,
    enum: ROLES,
    default: "user",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});
//Generate JWT Token
userSchema.methods.getAuthToken = function (sessionId) {
  const payload = { _id: this._id, role: this.role };
  // Include Session Id
  if (sessionId) payload.session_id = sessionId;
  const token = jwt.sign(payload, config.get("jwtPrivateKey"), {
    expiresIn: "8h",
  });
  return token;
};
// User Model
const User = mongoose.model("User", userSchema);
// User Validation - superadmin is DB-seeded only, never via API
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: passwordSchema,
    role: Joi.string().valid("admin", "user"),
  });

  return schema.validate(user);
}
// Status Validation
function validateStatus(body) {
  const schema = Joi.object({
    isActive: Joi.boolean().required(),
  });

  return schema.validate(body);
}
// Role Validation - superadmin not assignable via UI
function validateRole(body) {
  const schema = Joi.object({
    role: Joi.string().valid("admin", "user").required(),
  });

  return schema.validate(body);
}
// Name Validation
function validateName(body) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
  });

  return schema.validate(body);
}

exports.User = User;
exports.ROLES = ROLES;
exports.validate = validateUser;
exports.validateStatus = validateStatus;
exports.validateRole = validateRole;
exports.validateName = validateName;
