const mongoose = require("mongoose");
const TicketModel = require("../models/Ticket.model");
const CounterModel = require("../models/Counter.model");
const CommentModel = require("../models/Comment.model");
const { User } = require("../models/User.model");
const fs = require("fs");
const path = require("path");
const commentService = require("./Comment.service");

const uploadsRoot = path.join(__dirname, "..", "uploads", "tickets");
const TICKET_CODE_REGEX = /^\d{6,20}$/;

const validateTicketCode = (code) => {
  if (!TICKET_CODE_REGEX.test(code)) {
    const error = new Error("Invalid ticket code");
    error.status = 400;
    throw error;
  }
};

const buildScopeMatch = (requester, companyId, projectId) => {
  const match = {};
  if (requester.role === "superadmin") {
    if (companyId) match.company = new mongoose.Types.ObjectId(companyId);
    if (projectId) match.project = new mongoose.Types.ObjectId(projectId);
  } else if (requester.company) {
    match.company = new mongoose.Types.ObjectId(requester.company);
    if (projectId) match.project = new mongoose.Types.ObjectId(projectId);
    if (requester.role === "user") {
      match.allocatedUsers = new mongoose.Types.ObjectId(requester._id);
    }
  }
  return match;
};

const generateTicketCode = async (project) => {
  const companyId = project.company.companyId;
  const projectId = project.projectId;
  const counterId = `ticketCode:${companyId}:${projectId}`;
  const counter = await CounterModel.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true },
  );
  if (counter) {
    return `${companyId}${projectId}${counter.seq}`;
  }
  const newCounter = await CounterModel.create({ _id: counterId, seq: 1001 });
  return `${companyId}${projectId}${newCounter.seq}`;
};

exports.getAllTickets = async (requester, companyId, projectId) => {
  const scopeMatch = buildScopeMatch(requester, companyId, projectId);
  return await TicketModel.aggregate([
    ...(Object.keys(scopeMatch).length ? [{ $match: scopeMatch }] : []),
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

exports.createTicket = async (ticket, project) => {
  const ticketCode = await generateTicketCode(project);
  return await TicketModel.create({
    ...ticket,
    company: project.company._id,
    project: project._id,
    ticketCode,
  });
};

exports.getTicketById = async (code) => {
  validateTicketCode(code);
  return await TicketModel.findOne({ ticketCode: code }).populate(
    "allocatedUsers",
    "name email",
  );
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

exports.allocateTicket = async (code, userIds) => {
  validateTicketCode(code);
  const ticket = await TicketModel.findOne({ ticketCode: code });
  if (!ticket) return null;

  const previous = ticket.allocatedUsers.map((u) => String(u));
  const next = userIds.map((u) => String(u));

  // Feature 8: Comment Lock
  const commentCount = await CommentModel.countDocuments({ ticketCode: code });
  if (commentCount > 0) {
    const removed = previous.filter((id) => !next.includes(id));
    if (removed.length > 0) {
      const error = new Error(
        "Cannot unallocate users from a ticket that has comments.",
      );
      error.status = 400;
      throw error;
    }
  }

  ticket.allocatedUsers = next;
  const hadAllocation = previous.length > 0;
  const hasAllocation = next.length > 0;

  // Feature 10: Updated Status Logic
  if (hasAllocation && ticket.status === "New") {
    ticket.status = "Allocate";
  } else if (hadAllocation && !hasAllocation && ticket.status === "Allocate") {
    ticket.status = "New";
  }

  await ticket.save();

  // Feature 7: Removed implicit project access allocation
  return ticket;
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
  if (!ticket) return null;
  const ticketFolder = path.join(uploadsRoot, code);
  if (fs.existsSync(ticketFolder)) {
    fs.rmSync(ticketFolder, { recursive: true, force: true });
  }
  await ticket.deleteOne();
  await commentService.deleteCommentsByTicket(code);
  return ticket;
};

exports.ensureTicketCodes = async () => {
  const legacyTickets = await TicketModel.find({
    $or: [{ ticketCode: { $exists: false } }, { ticketCode: null }],
  }).populate({ path: "project", populate: { path: "company" } });
  for (const ticket of legacyTickets) {
    if (!ticket.project) continue;
    const newCode = await generateTicketCode(ticket.project);
    const oldFolder = path.join(uploadsRoot, String(ticket._id));
    const newFolder = path.join(uploadsRoot, newCode);
    if (fs.existsSync(oldFolder)) {
      fs.renameSync(oldFolder, newFolder);
    }
    ticket.ticketCode = newCode;
    await ticket.save();
  }
};

exports.searchTickets = async (
  { q, status, from, to },
  requester,
  companyId,
  projectId,
) => {
  const matchConditions = [];
  const scopeMatch = buildScopeMatch(requester, companyId, projectId);
  if (Object.keys(scopeMatch).length) matchConditions.push(scopeMatch);
  if (status) matchConditions.push({ status });
  if (from || to) {
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) {
      const endOfDay = new Date(to);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.$lte = endOfDay;
    }
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
  if (matchConditions.length)
    pipeline.push({ $match: { $and: matchConditions } });
  pipeline.push({ $project: { comments: 0 } });
  return await TicketModel.aggregate(pipeline);
};
