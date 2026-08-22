const TicketModel = require("../models/Ticket.model");
const CounterModel = require("../models/Counter.model");
const fs = require("fs");
const path = require("path");
const commentService = require("./Comment.service");

const uploadsRoot = path.join(__dirname, "..", "uploads", "tickets");

const TICKET_CODE_REGEX = /^\d{6}$/;

const validateTicketCode = (code) => {
  if (!TICKET_CODE_REGEX.test(code)) {
    const error = new Error("Invalid ticket code");
    error.status = 400;
    throw error;
  }
};

// Atomically increments a shared counter to produce sequential codes (100001, 100002, ...)
const generateTicketCode = async () => {
  const counter = await CounterModel.findOneAndUpdate(
    { _id: "ticketCode" },
    { $inc: { seq: 1 } },
    { new: true },
  );

  if (counter) {
    return counter.seq.toString();
  }

  // Counter doesn't exist yet - create it so the schema default (100000) applies, then start at 100001
  const newCounter = await CounterModel.create({
    _id: "ticketCode",
    seq: 100001,
  });

  return newCounter.seq.toString();
};

exports.getAllTickets = async () => {
  return await TicketModel.aggregate([
    {
      $lookup: {
        from: "comments",
        localField: "ticketCode",
        foreignField: "ticketCode",
        as: "comments",
      },
    },
    {
      $addFields: {
        commentCount: { $size: "$comments" },
      },
    },
    { $project: { comments: 0 } },
  ]);
};

exports.createTicket = async (ticket) => {
  const ticketCode = await generateTicketCode();

  return await TicketModel.create({ ...ticket, ticketCode });
};

exports.getTicketById = async (code) => {
  validateTicketCode(code);

  return await TicketModel.findOne({ ticketCode: code });
};

exports.updateTicket = async (code, ticket) => {
  validateTicketCode(code);

  return await TicketModel.findOneAndUpdate({ ticketCode: code }, ticket, {
    new: true,
    runValidators: true,
  });
};

exports.patchTicket = async (code, patchData) => {
  validateTicketCode(code);

  return await TicketModel.findOneAndUpdate(
    { ticketCode: code },
    { $set: patchData },
    { new: true, runValidators: true },
  );
};

exports.updateTicketStatus = async (code, status) => {
  validateTicketCode(code);

  return await TicketModel.findOneAndUpdate(
    { ticketCode: code },
    { $set: { status } },
    { new: true, runValidators: true },
  );
};

exports.uploadAttachments = async (code, files) => {
  validateTicketCode(code);

  const ticket = await TicketModel.findOne({ ticketCode: code });

  if (!ticket) {
    const error = new Error("Ticket not found");
    error.status = 404;
    throw error;
  }

  const ticketFolder = path.join(uploadsRoot, code);

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

exports.getAttachment = async (code, fileName) => {
  validateTicketCode(code);

  const ticket = await TicketModel.findOne({ ticketCode: code });

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

  const filePath = path.join(uploadsRoot, code, fileName);

  if (!fs.existsSync(filePath)) {
    const error = new Error("Attachment not found");
    error.status = 404;
    throw error;
  }

  return { attachment, filePath };
};

exports.deleteAttachment = async (code, fileName) => {
  validateTicketCode(code);

  const ticket = await TicketModel.findOne({ ticketCode: code });

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

  const filePath = path.join(uploadsRoot, code, fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  ticket.attachments = ticket.attachments.filter(
    (file) => file.fileName !== fileName,
  );

  await ticket.save();

  const ticketFolder = path.join(uploadsRoot, code);

  if (
    fs.existsSync(ticketFolder) &&
    fs.readdirSync(ticketFolder).length === 0
  ) {
    fs.rmdirSync(ticketFolder);
  }

  return ticket;
};

exports.deleteTicket = async (code) => {
  validateTicketCode(code);

  const ticket = await TicketModel.findOne({ ticketCode: code });

  if (!ticket) {
    return null;
  }

  const ticketFolder = path.join(uploadsRoot, code);

  if (fs.existsSync(ticketFolder)) {
    fs.rmSync(ticketFolder, { recursive: true, force: true });
  }

  await ticket.deleteOne();
  await commentService.deleteCommentsByTicket(code);

  return ticket;
};

// One-time migration: assigns a ticketCode (and renames the upload folder) for tickets that existed before this feature
exports.ensureTicketCodes = async () => {
  const legacyTickets = await TicketModel.find({
    $or: [{ ticketCode: { $exists: false } }, { ticketCode: null }],
  });

  for (const ticket of legacyTickets) {
    const newCode = await generateTicketCode();
    const oldFolder = path.join(uploadsRoot, String(ticket._id));
    const newFolder = path.join(uploadsRoot, newCode);

    if (fs.existsSync(oldFolder)) {
      fs.renameSync(oldFolder, newFolder);
    }

    ticket.ticketCode = newCode;
    await ticket.save();
  }

  if (legacyTickets.length) {
    console.log(
      `✅ Assigned ticket codes to ${legacyTickets.length} existing ticket(s)`,
    );
  }
};

exports.searchTickets = async ({ q, status, from, to }) => {
  const matchConditions = [];

  if (status) {
    matchConditions.push({ status });
  }

  if (from || to) {
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);
    matchConditions.push({ createdAt: dateFilter });
  }

  if (q) {
    const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safeQuery, "i");

    matchConditions.push({
      $or: [
        { subject: regex },
        { description: regex },
        { ticketCode: regex },
        { "attachments.originalName": regex },
        { "comments.message": regex },
        { "comments.attachments.originalName": regex },
      ],
    });
  }

  const pipeline = [
    {
      $lookup: {
        from: "comments",
        localField: "ticketCode",
        foreignField: "ticketCode",
        as: "comments",
      },
    },
  ];

  if (matchConditions.length) {
    pipeline.push({ $match: { $and: matchConditions } });
  }

  pipeline.push({ $project: { comments: 0 } });

  return await TicketModel.aggregate(pipeline);
};
