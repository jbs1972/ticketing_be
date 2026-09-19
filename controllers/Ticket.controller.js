const ticketService = require("../services/Ticket.service");
const ticketStatusService = require("../services/TicketStatus.service");
const { Project } = require("../models/Project.model");
const { sendSuccess, sendError } = require("../utils/responseFormatter");
const { emitTicketChanged } = require("../utils/socket");
const projectService = require("../services/Project.service");

const USER_FACING_FIELDS = ["subject", "description"];

const getValidationMessage = (err) => {
  const messages = Object.entries(err.errors)
    .filter(([field]) => USER_FACING_FIELDS.includes(field))
    .map(([, error]) => error.message);

  return messages.length
    ? messages.join(", ")
    : "The ticket could not be saved. Please try again.";
};

exports.getAllTickets = async (req, res) => {
  try {
    const { companyId, projectId } = req.query;

    if (req.user.role === "user" && projectId) {
      const isMember = await projectService.isUserAssignedToProject(
        req.user._id,
        projectId,
      );

      if (!isMember) {
        return sendError(
          res,
          "You do not have access to this project.",
          null,
          403,
        );
      }
    }

    const tickets = await ticketService.getAllTickets(
      req.user,
      companyId,
      projectId,
    );
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
    const { project: projectId, ...ticketData } = req.body;

    const project = await Project.findById(projectId).populate(
      "company",
      "companyId",
    );

    if (!project) {
      return sendError(res, "Project not found", null, 404);
    }

    if (
      req.user.role === "admin" &&
      String(project.company._id) !== String(req.user.company)
    ) {
      return sendError(
        res,
        "You cannot create tickets outside your company.",
        null,
        403,
      );
    }

    if (req.user.role === "user" && !project.isActive) {
      return sendError(
        res,
        "This project is frozen. You cannot create tickets in it.",
        null,
        403,
      );
    }

    const ticket = await ticketService.createTicket(ticketData, project);

    emitTicketChanged(ticket.ticketCode, "created", req.headers["x-socket-id"]);

    sendSuccess(res, "Ticket created successfully", ticket, 201);
  } catch (err) {
    if (err.name === "ValidationError") {
      return sendError(res, getValidationMessage(err), null, 400);
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
    const ticket = await ticketService.getTicketById(req.params.code);

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
    const ticket = await ticketService.updateTicket(req.params.code, req.body);

    if (!ticket) {
      return sendError(res, "Ticket not found", null, 404);
    }

    emitTicketChanged(ticket.ticketCode, "updated", req.headers["x-socket-id"]);

    sendSuccess(res, "Ticket updated successfully", ticket, 200);
  } catch (err) {
    if (err.name === "ValidationError") {
      return sendError(res, getValidationMessage(err), null, 400);
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
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";

    if (!isAdmin && Object.prototype.hasOwnProperty.call(req.body, "subject")) {
      return sendError(res, "Only Admin can update the subject.", null, 403);
    }

    if (
      !isAdmin &&
      Object.prototype.hasOwnProperty.call(req.body, "priority")
    ) {
      return sendError(res, "Only Admin can update the priority.", null, 403);
    }

    const ticket = await ticketService.patchTicket(req.params.code, req.body);

    if (!ticket) {
      return sendError(res, "Ticket not found", null, 404);
    }

    emitTicketChanged(ticket.ticketCode, "updated", req.headers["x-socket-id"]);

    sendSuccess(res, "Ticket partially updated successfully", ticket, 200);
  } catch (err) {
    if (err.name === "ValidationError") {
      return sendError(res, getValidationMessage(err), null, 400);
    }

    sendError(
      res,
      err.message || "Failed to update ticket",
      null,
      err.status || 500,
    );
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    if (!req.body.status) {
      return sendError(res, "Status is required.", null, 400);
    }

    if (req.user.role === "user") {
      return sendError(res, "You cannot change ticket status.", null, 403);
    }

    const existing = await ticketService.getTicketById(req.params.code);

    if (!existing) {
      return sendError(res, "Ticket not found", null, 404);
    }

    if (
      req.user.role === "admin" &&
      String(existing.company) !== String(req.user.company)
    ) {
      return sendError(
        res,
        "You cannot update tickets outside your company.",
        null,
        403,
      );
    }

    await ticketStatusService.validateStatusChange(
      existing.company,
      existing.status,
      req.body.status,
      req.user.role,
    );

    const ticket = await ticketService.updateTicketStatus(
      req.params.code,
      req.body.status,
    );

    emitTicketChanged(ticket.ticketCode, "updated", req.headers["x-socket-id"]);

    sendSuccess(res, "Ticket status updated successfully", ticket, 200);
  } catch (err) {
    if (err.name === "ValidationError") {
      return sendError(res, getValidationMessage(err), null, 400);
    }

    sendError(
      res,
      err.message || "Failed to update status",
      null,
      err.status || 500,
    );
  }
};

exports.allocateTicket = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users)) {
      return sendError(res, "A valid users array is required.", null, 400);
    }

    // No self allocation
    const filteredUsers = users.filter(
      (id) => String(id) !== String(req.user._id),
    );

    if (filteredUsers.some((id) => !/^[0-9a-fA-F]{24}$/.test(id))) {
      return sendError(res, "A valid users array is required.", null, 400);
    }

    const existing = await ticketService.getTicketById(req.params.code);

    if (!existing) {
      return sendError(res, "Ticket not found", null, 404);
    }

    if (
      req.user.role === "admin" &&
      String(existing.company) !== String(req.user.company)
    ) {
      return sendError(
        res,
        "You cannot allocate tickets outside your company.",
        null,
        403,
      );
    }

    for (const id of filteredUsers) {
      const isMember = await projectService.isUserAssignedToProject(
        id,
        existing.project,
      );
      if (!isMember) {
        return sendError(
          res,
          "Users must be assigned to the project before they can be allocated to a ticket.",
          null,
          400,
        );
      }
    }

    const ticket = await ticketService.allocateTicket(
      req.params.code,
      filteredUsers,
    );

    emitTicketChanged(ticket.ticketCode, "updated", req.headers["x-socket-id"]);

    sendSuccess(res, "Ticket allocation updated successfully", ticket, 200);
  } catch (err) {
    sendError(
      res,
      err.message || "Failed to allocate ticket",
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
      req.params.code,
      req.files,
    );

    emitTicketChanged(ticket.ticketCode, "updated", req.headers["x-socket-id"]);

    sendSuccess(res, "Attachments uploaded successfully", ticket, 200);
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
      req.params.code,
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
      req.params.code,
      req.params.fileName,
    );

    emitTicketChanged(ticket.ticketCode, "updated", req.headers["x-socket-id"]);

    sendSuccess(res, "Attachment deleted successfully", ticket, 200);
  } catch (err) {
    sendError(res, err.message, null, err.status || 500);
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await ticketService.deleteTicket(req.params.code);

    if (!ticket) {
      return sendError(res, "Ticket not found", null, 404);
    }

    res.status(204).end();

    emitTicketChanged(ticket.ticketCode, "deleted", req.headers["x-socket-id"]);
  } catch (err) {
    sendError(
      res,
      err.message || "Failed to delete ticket",
      null,
      err.status || 500,
    );
  }
};

exports.searchTickets = async (req, res) => {
  try {
    const { q, status, from, to, companyId, projectId } = req.query;

    if (req.user.role === "user" && projectId) {
      const isMember = await projectService.isUserAssignedToProject(
        req.user._id,
        projectId,
      );

      if (!isMember) {
        return sendError(
          res,
          "You do not have access to this project.",
          null,
          403,
        );
      }
    }

    const tickets = await ticketService.searchTickets(
      { q, status, from, to },
      req.user,
      companyId,
      projectId,
    );
    sendSuccess(res, "Tickets fetched successfully", tickets, 200);
  } catch (err) {
    sendError(
      res,
      err.message || "Could not search tickets",
      null,
      err.status || 500,
    );
  }
};
