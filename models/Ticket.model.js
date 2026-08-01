const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attachmentSchema = new Schema(
  {
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const ticketSchema = new Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      minlength: [5, "Subject must be at least 5 characters long"],
      maxlength: [100, "Subject cannot exceed 100 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      trim: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Ticket", ticketSchema);
