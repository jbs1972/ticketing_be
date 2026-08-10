const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentAttachmentSchema = new Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false },
);

const commentSchema = new Schema(
  {
    ticketCode: {
      type: String,
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: [true, "Comment message is required"],
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
    attachments: {
      type: [commentAttachmentSchema],
      default: [],
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("Comment", commentSchema);
