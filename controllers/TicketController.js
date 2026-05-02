const ticketService = require("../services/TicketServices");

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getAllTickets();
    res.json({ data: tickets, status: "successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const ticket = await ticketService.createTicket(req.body);
    res.json({ data: ticket, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    res.json({ data: ticket, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.body);
    res.json({ data: ticket, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await ticketService.deleteTicket(req.params.id);
    res.json({ data: ticket, status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
