const Joi = require("joi");
const { sendError } = require("../utils/responseFormatter");

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

exports.validateSendOtp = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return sendError(res, error.details[0].message, null, 400);
  }

  next();
};

exports.validateVerifyOtp = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return sendError(res, error.details[0].message, null, 400);
  }

  next();
};

exports.validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    newPassword: passwordSchema,
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return sendError(res, error.details[0].message, null, 400);
  }

  next();
};
