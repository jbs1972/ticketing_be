const companyService = require("../services/Company.service");
const { validate, validateStatus } = require("../models/Company.model");
const { sendSuccess, sendError } = require("../utils/responseFormatter");

exports.createCompany = async (req, res) => {
  try {
    const company = await companyService.createCompany(req.body);

    return sendSuccess(res, "Company created successfully", company, 201);
  } catch (err) {
    if (err.message.includes("already exists")) {
      return sendError(res, err.message, null, 400);
    }

    return sendError(res, "Failed to create company", err, 500);
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await companyService.getAllCompanies();

    return sendSuccess(res, "Companies fetched successfully", companies, 200);
  } catch (err) {
    return sendError(res, "Failed to fetch companies", err, 500);
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await companyService.getCompanyById(req.params.id);

    return sendSuccess(res, "Company fetched successfully", company, 200);
  } catch (err) {
    if (err.message.includes("not found")) {
      return sendError(res, err.message, null, 404);
    }

    return sendError(res, "Failed to fetch company", err, 500);
  }
};

exports.updateCompanyName = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return sendError(res, error.details[0].message, null, 400);
    }

    const company = await companyService.updateCompanyName(
      req.params.id,
      req.body.name,
    );

    return sendSuccess(res, "Company updated successfully", company, 200);
  } catch (err) {
    if (err.message.includes("not found")) {
      return sendError(res, err.message, null, 404);
    }

    return sendError(res, "Failed to update company", err, 500);
  }
};

exports.updateCompanyStatus = async (req, res) => {
  try {
    const { error } = validateStatus(req.body);
    if (error) {
      return sendError(res, error.details[0].message, null, 400);
    }

    const company = await companyService.updateCompanyStatus(
      req.params.id,
      req.body.isActive,
    );

    return sendSuccess(
      res,
      "Company status updated successfully",
      company,
      200,
    );
  } catch (err) {
    if (err.message.includes("not found")) {
      return sendError(res, err.message, null, 404);
    }

    return sendError(res, "Failed to update company status", err, 500);
  }
};
