const ticketService = require("../services/TicketServices");
const { sendSuccess, sendError } = require("../utils/responseFormatter");

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getAllTickets();
    sendSuccess(res, "Tickets fetched successfully", tickets, 200);
  } catch (err) {
    sendError(res, "Failed to fetch tickets", err, 500);
  }
};

exports.createTicket = async (req, res) => {
  try {
    const ticket = await ticketService.createTicket(req.body);
    sendSuccess(res, "Ticket created successfully", ticket, 201);
  } catch (err) {
    sendError(res, "Failed to create ticket", err, 500);
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
    sendError(res, "Failed to fetch ticket", err, 500);
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
    sendError(res, "Failed to update ticket", err, 500);
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
    sendError(res, "Failed to delete ticket", err, 500);
  }
};
