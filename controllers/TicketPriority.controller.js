const ticketPriorityService = require("../services/TicketPriority.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");

const resolveCompanyId = (req, provided) =>
  req.user.role === "superadmin" ? provided || null : req.user.company;

const assertCompanyAccess = (req, companyId) => {
  if (req.user.role === "superadmin") return;
  if (String(req.user.company) !== String(companyId)) {
    const error = new Error(
      "You cannot manage priorities outside your company.",
    );
    error.status = 403;
    throw error;
  }
};

const handle = (res, err, fallback) => {
  if (err.code === 11000) {
    return sendError(
      res,
      "A priority with this name already exists.",
      null,
      400,
    );
  }
  if (err.name === "ValidationError") {
    return sendError(
      res,
      Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
      null,
      400,
    );
  }
  sendError(res, err.message || fallback, null, err.status || 500);
};

exports.getAllPriorities = async (req, res) => {
  try {
    const companyId = resolveCompanyId(req, req.query.companyId);
    if (!companyId) return sendError(res, "Select a company.", null, 400);
    const priorities = await ticketPriorityService.getAllPriorities(companyId);
    sendSuccess(res, "Priorities fetched successfully", priorities, 200);
  } catch (err) {
    handle(res, err, "Failed to fetch priorities");
  }
};

exports.createPriority = async (req, res) => {
  try {
    const companyId = resolveCompanyId(req, req.body.companyId);
    if (!companyId) return sendError(res, "Select a company.", null, 400);
    assertCompanyAccess(req, companyId);
    const priority = await ticketPriorityService.createPriority(
      companyId,
      req.body,
    );
    sendSuccess(res, "Priority created successfully", priority, 201);
  } catch (err) {
    handle(res, err, "Failed to create priority");
  }
};

exports.updatePriority = async (req, res) => {
  try {
    const priority = await ticketPriorityService.updatePriority(
      req.params.id,
      req.body,
    );
    if (!priority) return sendError(res, "Priority not found", null, 404);
    assertCompanyAccess(req, priority.company);
    sendSuccess(res, "Priority updated successfully", priority, 200);
  } catch (err) {
    handle(res, err, "Failed to update priority");
  }
};

exports.deletePriority = async (req, res) => {
  try {
    const priority = await require("../models/TicketPriority.model").findById(
      req.params.id,
    );
    if (!priority) return sendError(res, "Priority not found", null, 404);
    assertCompanyAccess(req, priority.company);
    await ticketPriorityService.deletePriority(req.params.id);
    sendSuccess(res, "Priority deleted successfully", null, 200);
  } catch (err) {
    handle(res, err, "Failed to delete priority");
  }
};
