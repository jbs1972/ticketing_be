const Joi = require("joi");
const mongoose = require("mongoose");
const { toTitleCase } = require("../utils/textNormalizer");
const companySchema = new mongoose.Schema({
  companyId: {
    type: String,
    unique: true,
  },
    name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    unique: true,
    set: (v) => toTitleCase(v),
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const Company = mongoose.model("Company", companySchema);

// Company Validation
function validateCompany(company) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
  });

  return schema.validate(company);
}

// Status Validation
function validateCompanyStatus(body) {
  const schema = Joi.object({
    isActive: Joi.boolean().required(),
  });

  return schema.validate(body);
}

exports.Company = Company;
exports.validate = validateCompany;
exports.validateStatus = validateCompanyStatus;
