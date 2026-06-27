const express = require("express");
const auth = require("../middleware/Auth.middleware");
const admin = require("../middleware/Admin.middleware");
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
 *     description: Retrieve a list of all tickets in the system
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: Tickets fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tickets fetched successfully"
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 */

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create new ticket
 *     description: Create a new support ticket
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ticket created successfully"
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     description: Retrieve a specific ticket by its ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ticket ID
 *     responses:
 *       200:
 *         description: Ticket fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ticket fetched successfully"
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Update ticket (full replacement)
 *     description: Replace all fields of a ticket with new values
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketUpdateRequest'
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ticket updated successfully"
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /tickets/{id}:
 *   patch:
 *     summary: Partially update a ticket
 *     description: Update one or more fields of a ticket without sending the complete object
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketPatchRequest'
 *           examples:
 *             updateSubject:
 *               summary: Update subject only
 *               value:
 *                 subject: "Updated Ticket Subject"
 *             updateDescription:
 *               summary: Update description only
 *               value:
 *                 description: "Updated ticket description text"
 *             updateBoth:
 *               summary: Update both fields
 *               value:
 *                 subject: "New Subject"
 *                 description: "New Description"
 *     responses:
 *       200:
 *         description: Ticket partially updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ticket partially updated successfully"
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete ticket (Admin only)
 *     description: Delete a ticket from the system. Requires admin access.
 *     tags: [Tickets]
 *     security:
 *       - TokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ticket ID
 *     responses:
 *       204:
 *         description: Ticket deleted successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Ticket not found
 */

router.route("/").get(getAllTickets).post(validateCreateTicketMiddleware, createTicket);
router.route("/:id").get(getTicketById).put(validateUpdateTicketMiddleware, updateTicket).patch(validatePatchTicketMiddleware, patchTicket).delete([auth, admin], deleteTicket);

module.exports = router;
