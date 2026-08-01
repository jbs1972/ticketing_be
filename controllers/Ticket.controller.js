const fs = require("fs");
const ticketService = require("../services/Ticket.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");

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

    sendSuccess(res, "Ticket created successfully", ticket, 201);
  } catch (err) {
    if (err.name === "ValidationError") {
      return sendError(
        res,
        Object.values(err.errors)
          .map((error) => error.message)
          .join(", "),
        null,
        400,
      );
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
    const ticket = await ticketService.getTicketById(req.params.id);

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
    const ticket = await ticketService.updateTicket(req.params.id, req.body);

    if (!ticket) {
      return sendError(res, "Ticket not found", null, 404);
    }

    sendSuccess(res, "Ticket updated successfully", ticket, 200);
  } catch (err) {
    if (err.name === "ValidationError") {
      return sendError(
        res,
        Object.values(err.errors)
          .map((error) => error.message)
          .join(", "),
        null,
        400,
      );
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
    const ticket = await ticketService.patchTicket(req.params.id, req.body);

    if (!ticket) {
      return sendError(res, "Ticket not found", null, 404);
    }

    sendSuccess(res, "Ticket partially updated successfully", ticket, 200);
  } catch (err) {
    if (err.name === "ValidationError") {
      return sendError(
        res,
        Object.values(err.errors)
          .map((error) => error.message)
          .join(", "),
        null,
        400,
      );
    }

    sendError(
      res,
      err.message || "Failed to update ticket",
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
      req.params.id,
      req.files,
    );

    sendSuccess(
      res,
      "Attachments uploaded successfully",
      ticket,
      200,
    );
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
      req.params.id,
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
      req.params.id,
      req.params.fileName,
    );

    sendSuccess(
      res,
      "Attachment deleted successfully",
      ticket,
      200,
    );
  } catch (err) {
    sendError(res, err.message, null, err.status || 500);
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await ticketService.deleteTicket(req.params.id);

    if (!ticket) {
      return sendError(res, "Ticket not found", null, 404);
    }

    res.status(204).end();
  } catch (err) {
    sendError(
      res,
      err.message || "Failed to delete ticket",
      null,
      err.status || 500,
    );
  }
};
