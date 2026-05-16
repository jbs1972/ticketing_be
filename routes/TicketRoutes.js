const express = require("express");
const {
  getAllTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
} = require("../controllers/TicketController");

const {
  validateCreateTicketMiddleware,
  validateUpdateTicketMiddleware,
} = require("../validations/ticketValidation");

const router = express.Router();

router.route("/").get(getAllTickets).post(validateCreateTicketMiddleware, createTicket);
router.route("/:id").get(getTicketById).put(validateUpdateTicketMiddleware, updateTicket).delete(deleteTicket);

module.exports = router;
