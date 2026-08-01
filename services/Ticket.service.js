const TicketModel = require("../models/Ticket.model");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const uploadsRoot = path.join(__dirname, "..", "uploads", "tickets");

const validateTicketId = (ticketId) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    const error = new Error("Invalid ticket id");
    error.status = 400;
    throw error;
  }
};

exports.getAllTickets = async () => {
  return await TicketModel.find();
};

exports.createTicket = async (ticket) => {
  return await TicketModel.create(ticket);
};

exports.getTicketById = async (id) => {
  validateTicketId(id);

  return await TicketModel.findById(id);
};

exports.updateTicket = async (id, ticket) => {
  validateTicketId(id);

  return await TicketModel.findByIdAndUpdate(id, ticket, {
    new: true,
    runValidators: true,
  });
};

exports.patchTicket = async (id, patchData) => {
  validateTicketId(id);

  return await TicketModel.findByIdAndUpdate(
    id,
    {
      $set: patchData,
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

exports.uploadAttachments = async (ticketId, files) => {
  validateTicketId(ticketId);

  const ticket = await TicketModel.findById(ticketId);

  if (!ticket) {
    const error = new Error("Ticket not found");
    error.status = 404;
    throw error;
  }

  const ticketFolder = path.join(uploadsRoot, ticketId);

  fs.mkdirSync(ticketFolder, { recursive: true });

  files.forEach((file) => {
    const destination = path.join(ticketFolder, file.filename);

    fs.renameSync(file.path, destination);

    ticket.attachments.push({
      originalName: file.originalname,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
    });
  });

  await ticket.save();

  return ticket;
};

exports.getAttachment = async (ticketId, fileName) => {
  validateTicketId(ticketId);

  const ticket = await TicketModel.findById(ticketId);

  if (!ticket) {
    const error = new Error("Ticket not found");
    error.status = 404;
    throw error;
  }

  const attachment = ticket.attachments.find(
    (file) => file.fileName === fileName,
  );

  if (!attachment) {
    const error = new Error("Attachment not found");
    error.status = 404;
    throw error;
  }

  const filePath = path.join(uploadsRoot, ticketId, fileName);

  if (!fs.existsSync(filePath)) {
    const error = new Error("Attachment not found");
    error.status = 404;
    throw error;
  }

  return {
    attachment,
    filePath,
  };
};

exports.deleteAttachment = async (ticketId, fileName) => {
  validateTicketId(ticketId);

  const ticket = await TicketModel.findById(ticketId);

  if (!ticket) {
    const error = new Error("Ticket not found");
    error.status = 404;
    throw error;
  }

  const attachment = ticket.attachments.find(
    (file) => file.fileName === fileName,
  );

  if (!attachment) {
    const error = new Error("Attachment not found");
    error.status = 404;
    throw error;
  }

  const filePath = path.join(uploadsRoot, ticketId, fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  ticket.attachments = ticket.attachments.filter(
    (file) => file.fileName !== fileName,
  );

  await ticket.save();

  const ticketFolder = path.join(uploadsRoot, ticketId);

  if (
    fs.existsSync(ticketFolder) &&
    fs.readdirSync(ticketFolder).length === 0
  ) {
    fs.rmdirSync(ticketFolder);
  }

  return ticket;
};

exports.deleteTicket = async (id) => {
  validateTicketId(id);

  const ticket = await TicketModel.findById(id);

  if (!ticket) {
    return null;
  }

  const ticketFolder = path.join(uploadsRoot, id);

  if (fs.existsSync(ticketFolder)) {
    fs.rmSync(ticketFolder, {
      recursive: true,
      force: true,
    });
  }

  await ticket.deleteOne();

  return ticket;
};
