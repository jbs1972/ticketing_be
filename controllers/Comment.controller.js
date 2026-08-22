const fs = require("fs");
const commentService = require("../services/Comment.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");
const { emitTicketChanged } = require("../utils/socket");

exports.getComments = async (req, res) => {
  try {
    const comments = await commentService.getCommentsByTicket(req.params.code);
    sendSuccess(res, "Comments fetched successfully", comments, 200);
  } catch (err) {
    sendError(
      res,
      err.message || "Failed to fetch comments",
      null,
      err.status || 500,
    );
  }
};

exports.createComment = async (req, res) => {
  try {
    if (!req.body.message || !req.body.message.trim()) {
      return sendError(res, "Comment message is required.", null, 400);
    }

    const comment = await commentService.createComment(
      req.params.code,
      req.user._id,
      req.body.message,
      req.files || [],
    );

    emitTicketChanged(req.params.code, "commented", req.headers["x-socket-id"]);

    sendSuccess(res, "Comment added successfully", comment, 201);
  } catch (err) {
    if (req.files?.length) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }

    sendError(
      res,
      err.message || "Failed to add comment",
      null,
      err.status || 500,
    );
  }
};

exports.updateComment = async (req, res) => {
  try {
    if (!req.body.message || !req.body.message.trim()) {
      return sendError(res, "Comment message is required.", null, 400);
    }

    const comment = await commentService.updateComment(
      req.params.code,
      req.params.commentId,
      req.user._id,
      req.body.message.trim(),
      req.files || [],
    );

    emitTicketChanged(req.params.code, "commented", req.headers["x-socket-id"]);

    sendSuccess(res, "Comment updated successfully", comment, 200);
  } catch (err) {
    if (req.files?.length) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }

    sendError(
      res,
      err.message || "Failed to update comment",
      null,
      err.status || 500,
    );
  }
};

exports.deleteComment = async (req, res) => {
  try {
    await commentService.deleteComment(
      req.params.code,
      req.params.commentId,
      req.user._id,
    );

    emitTicketChanged(req.params.code, "commented", req.headers["x-socket-id"]);

    sendSuccess(res, "Comment deleted successfully", null, 200);
  } catch (err) {
    sendError(
      res,
      err.message || "Failed to delete comment",
      null,
      err.status || 500,
    );
  }
};

exports.downloadCommentAttachment = async (req, res) => {
  try {
    const { attachment, filePath } = await commentService.getCommentAttachment(
      req.params.code,
      req.params.commentId,
      req.params.fileName,
    );

    return res.download(filePath, attachment.originalName);
  } catch (err) {
    sendError(res, err.message, null, err.status || 500);
  }
};

exports.deleteCommentAttachment = async (req, res) => {
  try {
    const comment = await commentService.deleteCommentAttachment(
      req.params.code,
      req.params.commentId,
      req.params.fileName,
      req.user._id,
    );

    emitTicketChanged(req.params.code, "commented", req.headers["x-socket-id"]);

    sendSuccess(res, "Attachment deleted successfully", comment, 200);
  } catch (err) {
    sendError(
      res,
      err.message || "Failed to delete attachment",
      null,
      err.status || 500,
    );
  }
};

exports.searchComments = async (req, res) => {
  try {
    const { q, from, to } = req.query;
    const comments = await commentService.searchComments(req.params.code, {
      q,
      from,
      to,
    });
    sendSuccess(res, "Comments fetched successfully", comments, 200);
  } catch (err) {
    sendError(
      res,
      err.message || "Failed to search comments",
      null,
      err.status || 500,
    );
  }
};
