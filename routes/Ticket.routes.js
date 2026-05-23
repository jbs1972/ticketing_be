const express = require("express");
const {
  getAllTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
} = require("../controllers/Ticket.controller");

const {
  validateCreateTicketMiddleware,
  validateUpdateTicketMiddleware,
} = require("../validations/ticketValidation");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket Management APIs
 */

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get all tickets
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: Tickets fetched successfully
 */

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create new ticket
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketCreateRequest'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 */

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket fetched successfully
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Update ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketUpdateRequest'
 *
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete ticket
 *     tags: [Tickets]
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       204:
 *         description: Ticket deleted successfully
 *       404:
 *         description: Ticket not found
 */

router.route("/").get(getAllTickets).post(validateCreateTicketMiddleware, createTicket);
router.route("/:id").get(getTicketById).put(validateUpdateTicketMiddleware, updateTicket).delete(deleteTicket);

module.exports = router;
