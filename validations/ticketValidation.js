const Joi = require("joi");

/**
 * Joi schema for creating a ticket
 */
const createTicketSchema = Joi.object({
  subject: Joi.string()
    .required()
    .min(5)
    .max(100)
    .trim()
    .messages({
      "string.empty": "Subject is required",
      "string.min": "Subject must be at least 5 characters long",
      "string.max": "Subject cannot exceed 100 characters",
      "any.required": "Subject is required",
    }),
  description: Joi.string()
    .required()
    .min(10)
    .max(1000)
    .trim()
    .messages({
      "string.empty": "Description is required",
      "string.min": "Description must be at least 10 characters long",
      "string.max": "Description cannot exceed 1000 characters",
      "any.required": "Description is required",
    }),
});

/**
 * Joi schema for updating a ticket
 */
const updateTicketSchema = Joi.object({
  subject: Joi.string()
    .min(5)
    .max(100)
    .trim()
    .optional()
    .messages({
      "string.min": "Subject must be at least 5 characters long",
      "string.max": "Subject cannot exceed 100 characters",
    }),
  description: Joi.string()
    .min(10)
    .max(1000)
    .trim()
    .optional()
    .messages({
      "string.min": "Description must be at least 10 characters long",
      "string.max": "Description cannot exceed 1000 characters",
    }),
}).min(1).messages({
  "object.min": "At least one field must be provided for update",
});

/*
|--------------------------------------------------------------------------
| Partial Update Validation (PATCH)
|--------------------------------------------------------------------------
*/
const patchTicketSchema = Joi.object({
  subject: Joi.string()
    .min(5)
    .max(100),

  description: Joi.string()
    .min(10)
    .max(1000),
}).min(1);

/**
 * Validate create ticket request
 */
const validateCreateTicket = (data) => {
  return createTicketSchema.validate(data, { abortEarly: false });
};

/**
 * Validate update ticket request
 */
const validateUpdateTicket = (data) => {
  return updateTicketSchema.validate(data, { abortEarly: false });
};

/**
 * Middleware to validate create ticket
 */
const validateCreateTicketMiddleware = (req, res, next) => {
  const { error, value } = validateCreateTicket(req.body);
  if (error) {
    const messages = error.details.map(err => err.message);
    return res.status(400).json({
      message: "Validation failed",
      data: { errors: messages },
      status: 400,
    });
  }
  req.body = value;
  next();
};

/**
 * Middleware to validate update ticket
 */
const validateUpdateTicketMiddleware = (req, res, next) => {
  const { error, value } = validateUpdateTicket(req.body);
  if (error) {
    const messages = error.details.map(err => err.message);
    return res.status(400).json({
      message: "Validation failed",
      data: { errors: messages },
      status: 400,
    });
  }
  req.body = value;
  next();
};

const validatePatchTicketMiddleware = (req, res, next) => {
  const { error } = patchTicketSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  next();
};

module.exports = {
  validateCreateTicket,
  validateUpdateTicket,
  validateCreateTicketMiddleware,
  validateUpdateTicketMiddleware,
  validatePatchTicketMiddleware,
};
