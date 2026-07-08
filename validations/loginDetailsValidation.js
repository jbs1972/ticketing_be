const Joi = require("joi");
const objectId = require("joi-objectid")(Joi);

const createLoginDetailsSchema = Joi.object({
  user_id: objectId()
    .required()
    .messages({
      "string.pattern.base": "User ID must be a valid MongoDB ObjectId",
      "any.required": "User ID is required",
    }),
  login_time: Joi.date().optional(),
  logout_time: Joi.date().optional(),
  is_active: Joi.boolean().optional(),
});

const validateCreateLoginDetails = (data) => {
  return createLoginDetailsSchema.validate(data, { abortEarly: false });
};

const validateCreateLoginDetailsMiddleware = (req, res, next) => {
  const { error, value } = validateCreateLoginDetails(req.body);
  if (error) {
    const messages = error.details.map((err) => err.message);
    return res.status(400).json({
      message: "Validation failed",
      data: { errors: messages },
      status: 400,
    });
  }
  req.body = value;
  next();
};

module.exports = {
  validateCreateLoginDetails,
  validateCreateLoginDetailsMiddleware
};