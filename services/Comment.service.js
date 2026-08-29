const CommentModel = require("../models/Comment.model");
const { User } = require("../models/User.model");
const fs = require("fs");
const path = require("path");

const uploadsRoot = path.join(__dirname, "..", "uploads", "tickets");

exports.getCommentsByTicket = async (ticketCode) => {
  return await CommentModel.find({ ticketCode }).sort({ createdAt: -1 });
};

exports.createComment = async (
  ticketCode,
  userId,
  message,
  files = [],
  mentionedUserIds = [],
) => {
  const user = await User.findById(userId).select("name");

  const comment = await CommentModel.create({
    ticketCode,
    authorId: userId,
    authorName: user?.name || "Unknown",
    message,
    mentions: mentionedUserIds,
  });

  if (files.length) {
    const commentFolder = path.join(
      uploadsRoot,
      ticketCode,
      "comments",
      String(comment._id),
    );

    fs.mkdirSync(commentFolder, { recursive: true });

    files.forEach((file) => {
      const destination = path.join(commentFolder, file.filename);
      fs.renameSync(file.path, destination);

      comment.attachments.push({
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
      });
    });

    await comment.save();
  }

  return comment;
};

exports.updateComment = async (
  ticketCode,
  commentId,
  userId,
  message,
  files = [],
  mentionedUserIds = null,
) => {
  const comment = await CommentModel.findOne({ _id: commentId, ticketCode });

  if (!comment) {
    const error = new Error("Comment not found");
    error.status = 404;
    throw error;
  }

  if (comment.authorId.toString() !== userId.toString()) {
    const error = new Error("You can only edit your own comments.");
    error.status = 403;
    throw error;
  }

  comment.message = message;

  if (mentionedUserIds !== null) {
    comment.mentions = mentionedUserIds;
  }

  if (files.length) {
    const commentFolder = path.join(
      uploadsRoot,
      ticketCode,
      "comments",
      String(comment._id),
    );

    fs.mkdirSync(commentFolder, { recursive: true });

    files.forEach((file) => {
      const destination = path.join(commentFolder, file.filename);
      fs.renameSync(file.path, destination);

      comment.attachments.push({
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
      });
    });
  }

  await comment.save();

  return comment;
};

exports.deleteComment = async (ticketCode, commentId, userId) => {
  const comment = await CommentModel.findOne({ _id: commentId, ticketCode });

  if (!comment) {
    const error = new Error("Comment not found");
    error.status = 404;
    throw error;
  }

  if (comment.authorId.toString() !== userId.toString()) {
    const error = new Error("You can only delete your own comments.");
    error.status = 403;
    throw error;
  }

  if (comment.attachments.length) {
    const commentFolder = path.join(
      uploadsRoot,
      ticketCode,
      "comments",
      String(comment._id),
    );

    if (fs.existsSync(commentFolder)) {
      fs.rmSync(commentFolder, { recursive: true, force: true });
    }
  }

  await comment.deleteOne();

  return comment;
};

exports.getCommentAttachment = async (ticketCode, commentId, fileName) => {
  const comment = await CommentModel.findOne({ _id: commentId, ticketCode });

  if (!comment) {
    const error = new Error("Comment not found");
    error.status = 404;
    throw error;
  }

  const attachment = comment.attachments.find((f) => f.fileName === fileName);

  if (!attachment) {
    const error = new Error("Attachment not found");
    error.status = 404;
    throw error;
  }

  const filePath = path.join(
    uploadsRoot,
    ticketCode,
    "comments",
    String(comment._id),
    fileName,
  );

  if (!fs.existsSync(filePath)) {
    const error = new Error("Attachment not found");
    error.status = 404;
    throw error;
  }

  return { attachment, filePath };
};

exports.deleteCommentsByTicket = async (ticketCode) => {
  await CommentModel.deleteMany({ ticketCode });
};

exports.deleteCommentAttachment = async (
  ticketCode,
  commentId,
  fileName,
  userId,
) => {
  const comment = await CommentModel.findOne({ _id: commentId, ticketCode });

  if (!comment) {
    const error = new Error("Comment not found");
    error.status = 404;
    throw error;
  }

  if (comment.authorId.toString() !== userId.toString()) {
    const error = new Error("You can only delete your own attachments.");
    error.status = 403;
    throw error;
  }

  const attachment = comment.attachments.find((f) => f.fileName === fileName);

  if (!attachment) {
    const error = new Error("Attachment not found");
    error.status = 404;
    throw error;
  }

  const filePath = path.join(
    uploadsRoot,
    ticketCode,
    "comments",
    String(comment._id),
    fileName,
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  comment.attachments = comment.attachments.filter(
    (f) => f.fileName !== fileName,
  );

  await comment.save();

  return comment;
};

exports.searchComments = async (ticketCode, { q, from, to }) => {
  const conditions = { ticketCode };

  if (from || to) {
    conditions.createdAt = {};
    if (from) conditions.createdAt.$gte = new Date(from);
    if (to) {
      const endOfDay = new Date(to);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.createdAt.$lte = endOfDay;
    }
  }

  if (q) {
    const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safeQuery, "i");

    conditions.$or = [
      { message: regex },
      { authorName: regex },
      { "attachments.originalName": regex },
    ];
  }

  return await CommentModel.find(conditions).sort({ createdAt: -1 });
};

exports.getMentionsForUser = async (userId) => {
  const comments = await CommentModel.find({ mentions: userId })
    .select("ticketCode")
    .sort({ createdAt: -1 });

  const mentionsByTicket = {};

  comments.forEach((comment) => {
    if (!mentionsByTicket[comment.ticketCode]) {
      mentionsByTicket[comment.ticketCode] = [];
    }
    mentionsByTicket[comment.ticketCode].push(comment._id);
  });

  return mentionsByTicket;
};
