const fs = require("fs");
const ticketService = require("../services/Ticket.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");
const { emitTicketChanged } = require("../utils/socket");

const USER_FACING_FIELDS = ["subject", "description"];

// Only surface validation messages for fields the user actually filled in
const getValidationMessage = (err) => {
  const messages = Object.entries(err.errors)
    .filter(([field]) => USER_FACING_FIELDS.includes(field))
    .map(([, error]) => error.message);

  return messages.length
    ? messages.join(", ")
    : "The ticket could not be saved. Please try again.";
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getAllTickets();
    sendSuccess(res, "Tickets fetched successfully", tickets, 200);
  } catch (err) {
    sendError(
      res,
      err.message || "Failed to fetch tickets",
      null,
      err.status || 500,
    );
  }
};

exports.createTicket = async (req, res) => {
  try {
    const ticket = await ticketService.createTicket(req.body);

    emitTicketChanged(ticket.ticketCode, "created", req.headers["x-socket-id"]);

    sendSuccess(res, "Ticket created successfully", ticket, 201);
  } catch (err) {
    if (err.name === "ValidationError") {
      return sendError(res, getValidationMessage(err), null, 400);
    }

    sendError(
      res,
      err.message || "Failed to create ticket",
      null,
      err.status || 500,
    );
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.code);

    if (!ticket) {
      return sendError(res, "Ticket not found", null, 404);
    }

    sendSuccess(res, "Ticket fetched successfully", ticket, 200);
  } catch (err) {
    sendError(
      res,
      err.message || "Failed to fetch ticket",
      null,
      err.status || 500,
    );
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await ticketService.updateTicket(req.params.code, req.body);

    if (!ticket) {
      return sendError(res, "Ticket not found", null, 404);
    }

    emitTicketChanged(ticket.ticketCode, "updated", req.headers["x-socket-id"]);

    sendSuccess(res, "Ticket updated successfully", ticket, 200);
  } catch (err) {
    if (err.name === "ValidationError") {
      return sendError(res, getValidationMessage(err), null, 400);
    }

    sendError(
      res,
      err.message || "Failed to update ticket",
      null,
      err.status || 500,
    );
  }
};

exports.patchTicket = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && Object.prototype.hasOwnProperty.call(req.body, "subject")) {
      return sendError(res, "Only Admin can update the subject.", null, 403);
    }

    const ticket = await ticketService.patchTicket(req.params.code, req.body);

    if (!ticket) {
      return sendError(res, "Ticket not found", null, 404);
    }

    emitTicketChanged(ticket.ticketCode, "updated", req.headers["x-socket-id"]);

    sendSuccess(res, "Ticket partially updated successfully", ticket, 200);
  } catch (err) {
    if (err.name === "ValidationError") {
      return sendError(res, getValidationMessage(err), null, 400);
    }

    sendError(
      res,
      err.message || "Failed to update ticket",
      null,
      err.status || 500,
    );
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    if (!req.body.status) {
      return sendError(res, "Status is required.", null, 400);
    }

    const ticket = await ticketService.updateTicketStatus(
      req.params.code,
      req.body.status,
    );

    if (!ticket) {
      return sendError(res, "Ticket not found", null, 404);
    }

    emitTicketChanged(ticket.ticketCode, "updated", req.headers["x-socket-id"]);

    sendSuccess(res, "Ticket status updated successfully", ticket, 200);
  } catch (err) {
    if (err.name === "ValidationError") {
      return sendError(res, getValidationMessage(err), null, 400);
    }

    sendError(
      res,
      err.message || "Failed to update status",
      null,
      err.status || 500,
    );
  }
};

exports.uploadAttachments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, "Please select at least one file.", null, 400);
    }

    const ticket = await ticketService.uploadAttachments(
      req.params.code,
      req.files,
    );

    emitTicketChanged(ticket.ticketCode, "updated", req.headers["x-socket-id"]);

    sendSuccess(res, "Attachments uploaded successfully", ticket, 200);
  } catch (err) {
    if (req.files?.length) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    sendError(res, err.message, null, err.status || 500);
  }
};

exports.downloadAttachment = async (req, res) => {
  try {
    const { attachment, filePath } = await ticketService.getAttachment(
      req.params.code,
      req.params.fileName,
    );

    return res.download(filePath, attachment.originalName);
  } catch (err) {
    sendError(res, err.message, null, err.status || 500);
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const ticket = await ticketService.deleteAttachment(
      req.params.code,
      req.params.fileName,
    );

    emitTicketChanged(ticket.ticketCode, "updated", req.headers["x-socket-id"]);

    sendSuccess(res, "Attachment deleted successfully", ticket, 200);
  } catch (err) {
    sendError(res, err.message, null, err.status || 500);
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await ticketService.deleteTicket(req.params.code);

    if (!ticket) {
      return sendError(res, "Ticket not found", null, 404);
    }

    res.status(204).end();

    emitTicketChanged(ticket.ticketCode, "deleted", req.headers["x-socket-id"]);
  } catch (err) {
    sendError(
      res,
      err.message || "Failed to delete ticket",
      null,
      err.status || 500,
    );
  }
};
