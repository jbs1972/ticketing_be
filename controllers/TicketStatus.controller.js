const ticketStatusService = require("../services/TicketStatus.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");

const resolveCompanyId = (req, provided) =>
  req.user.role === "superadmin" ? provided || null : req.user.company;

const assertCompanyAccess = (req, companyId) => {
  if (req.user.role === "superadmin") return;
  if (String(req.user.company) !== String(companyId)) {
    const error = new Error("You cannot manage statuses outside your company.");
    error.status = 403;
    throw error;
  }
};

const handle = (res, err, fallback) => {
  if (err.code === 11000) {
    return sendError(res, "A status with this name already exists.", null, 400);
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

exports.getAllStatuses = async (req, res) => {
  try {
    const companyId = resolveCompanyId(req, req.query.companyId);
    if (!companyId) return sendError(res, "Select a company.", null, 400);
    const statuses = await ticketStatusService.getAllStatuses(companyId);
    sendSuccess(res, "Statuses fetched successfully", statuses, 200);
  } catch (err) {
    handle(res, err, "Failed to fetch statuses");
  }
};

exports.createStatus = async (req, res) => {
  try {
    const companyId = resolveCompanyId(req, req.body.companyId);
    if (!companyId) return sendError(res, "Select a company.", null, 400);
    assertCompanyAccess(req, companyId);
    const status = await ticketStatusService.createStatus(companyId, req.body);
    sendSuccess(res, "Status created successfully", status, 201);
  } catch (err) {
    handle(res, err, "Failed to create status");
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const existing = await ticketStatusService.getStatusById(req.params.id);
    if (!existing) return sendError(res, "Status not found", null, 404);
    assertCompanyAccess(req, existing.company);
    const status = await ticketStatusService.updateStatus(
      req.params.id,
      req.body,
    );
    sendSuccess(res, "Status updated successfully", status, 200);
  } catch (err) {
    handle(res, err, "Failed to update status");
  }
};

exports.deleteStatus = async (req, res) => {
  try {
    const existing = await ticketStatusService.getStatusById(req.params.id);
    if (!existing) return sendError(res, "Status not found", null, 404);
    assertCompanyAccess(req, existing.company);
    await ticketStatusService.deleteStatus(req.params.id);
    sendSuccess(res, "Status deleted successfully", null, 200);
  } catch (err) {
    handle(res, err, "Failed to delete status");
  }
};

exports.reorderStatuses = async (req, res) => {
  try {
    const companyId = resolveCompanyId(req, req.body.companyId);
    if (!companyId) return sendError(res, "Select a company.", null, 400);
    assertCompanyAccess(req, companyId);
    const statuses = await ticketStatusService.reorderStatuses(
      companyId,
      req.body.orderedIds,
    );
    sendSuccess(res, "Status sequence updated successfully", statuses, 200);
  } catch (err) {
    handle(res, err, "Failed to update sequence");
  }
};
