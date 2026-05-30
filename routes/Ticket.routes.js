const express = require("express");
const {
  getAllTickets,
  createTicket,
  getTicketById,
  updateTicket,
  patchTicket,
  deleteTicket,
} = require("../controllers/Ticket.controller");

const {
  validateCreateTicketMiddleware,
  validateUpdateTicketMiddleware,
  validatePatchTicketMiddleware,
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
 *   patch:
 *     summary: Partially update a ticket
 *     description: Update one or more fields of a ticket without sending the complete object.
 *     tags: [Tickets]
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketPatchRequest'
 *
 *           examples:
 *             updateSubject:
 *               summary: Update subject only
 *               value:
 *                 subject: "Updated Ticket Subject"
 *
 *             updateDescription:
 *               summary: Update description only
 *               value:
 *                 description: "Updated ticket description text"
 *
 *             updateBoth:
 *               summary: Update both fields
 *               value:
 *                 subject: "New Subject"
 *                 description: "New Description"
 *
 *     responses:
 *       200:
 *         description: Ticket partially updated successfully
 *
 *       404:
 *         description: Ticket not found
 *
 *       400:
 *         description: Validation error
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
router.route("/:id").get(getTicketById).put(validateUpdateTicketMiddleware, updateTicket).patch(validatePatchTicketMiddleware, patchTicket).delete(deleteTicket);

module.exports = router;
