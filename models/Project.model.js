const Joi = require("joi");
const mongoose = require("mongoose");
const { toTitleCase } = require("../utils/textNormalizer");
const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
  },
    name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    set: (v) => toTitleCase(v),
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
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

// Prevent duplicate project names within the same company
projectSchema.index({ company: 1, name: 1 }, { unique: true });

// projectId is only unique per company, not globally
projectSchema.index({ company: 1, projectId: 1 }, { unique: true });

const Project = mongoose.model("Project", projectSchema);

// Project Validation
function validateProject(project) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    company: Joi.string(),
  });

  return schema.validate(project);
}

// Name Validation (for updates - company is immutable once set)
function validateProjectName(body) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
  });

  return schema.validate(body);
}

// Status Validation
function validateProjectStatus(body) {
  const schema = Joi.object({
    isActive: Joi.boolean().required(),
  });

  return schema.validate(body);
}

exports.Project = Project;
exports.validate = validateProject;
exports.validateName = validateProjectName;
exports.validateStatus = validateProjectStatus;
