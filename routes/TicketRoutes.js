const express = require("express");
const {
  getAllTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
} = require("../controllers/TicketController");

const router = express.Router();

router.route("/").get(getAllTickets).post(createTicket);
router.route("/:id").get(getTicketById).put(updateTicket).delete(deleteTicket);

module.exports = router;
