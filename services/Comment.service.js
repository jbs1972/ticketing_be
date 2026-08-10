const CommentModel = require("../models/Comment.model");
const { User } = require("../models/User.model");
const fs = require("fs");
const path = require("path");

const uploadsRoot = path.join(__dirname, "..", "uploads", "tickets");

exports.getCommentsByTicket = async (ticketCode) => {
  return await CommentModel.find({ ticketCode }).sort({ createdAt: 1 });
};

exports.createComment = async (ticketCode, userId, message, files = []) => {
  const user = await User.findById(userId).select("name");

  const comment = await CommentModel.create({
    ticketCode,
    authorId: userId,
    authorName: user?.name || "Unknown",
    message,
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
