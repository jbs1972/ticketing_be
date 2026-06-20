const config = require('config');
const jwt = require('jsonwebtoken');

const Joi = require('joi');
const mongoose = require('mongoose');

// Custom password validation schema
const passwordSchema = Joi.string()
  .min(6)
  .max(20)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@])[A-Za-z\d#$@]{6,20}$/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (#, @, or $)',
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must not exceed 20 characters',
    'any.required': 'Password is required'
  });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024  // Allow longer passwords for bcrypt hashes
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
  // roles: []
  // operations: []
});
userSchema.methods.getAuthToken = function() {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get("jwtPrivateKey"));
    return token;
}
const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: passwordSchema,
    isAdmin: Joi.boolean()
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;