const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
  subject: String,
  description: String,
});

module.exports = mongoose.model("Ticket", ticketSchema);