const TicketModel = require("../models/Ticket");

exports.getAllTickets = async () => {
  return await TicketModel.find();
};

exports.createTicket = async (ticket) => {
  return await TicketModel.create(ticket);
};
exports.getTicketById = async (id) => {
  return await TicketModel.findById(id);
};

exports.updateTicket = async (id, ticket) => {
  return await TicketModel.findByIdAndUpdate(id, ticket);
};

exports.deleteTicket = async (id) => {
  return await TicketModel.findByIdAndDelete(id);
};
