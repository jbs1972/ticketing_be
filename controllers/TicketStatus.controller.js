const ticketStatusService = require("../services/TicketStatus.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");

exports.getAllStatuses = async (req, res) => {
  try {
    const statuses = await ticketStatusService.getAllStatuses();
    sendSuccess(res, "Statuses fetched successfully", statuses, 200);
  } catch (err) {
    sendError(
      res,
      err.message || "Failed to fetch statuses",
      null,
      err.status || 500,
    );
  }
};

exports.createStatus = async (req, res) => {
  try {
    const status = await ticketStatusService.createStatus(req.body);
    sendSuccess(res, "Status created successfully", status, 201);
  } catch (err) {
    if (err.code === 11000) {
      return sendError(
        res,
        "A status with this name already exists.",
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
    sendError(
      res,
      err.message || "Failed to create status",
      null,
      err.status || 500,
    );
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const status = await ticketStatusService.updateStatus(
      req.params.id,
      req.body,
    );
    if (!status) return sendError(res, "Status not found", null, 404);
    sendSuccess(res, "Status updated successfully", status, 200);
  } catch (err) {
    if (err.code === 11000) {
      return sendError(
        res,
        "A status with this name already exists.",
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
    sendError(
      res,
      err.message || "Failed to update status",
      null,
      err.status || 500,
    );
  }
};

exports.deleteStatus = async (req, res) => {
  try {
    await ticketStatusService.deleteStatus(req.params.id);
    sendSuccess(res, "Status deleted successfully", null, 200);
  } catch (err) {
    sendError(
      res,
      err.message || "Failed to delete status",
      null,
      err.status || 500,
    );
  }
};
