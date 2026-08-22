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
    ticketCode: {
      type: String,
      unique: true,
      sparse: true,
      minlength: 6,
      maxlength: 6,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      validate: {
        validator: function (value) {
          const stripped = (value || "")
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim();
          return stripped.length >= 2;
        },
        message: "Description must be at least 2 characters long",
      },
    },
    status: {
      type: String,
      default: "New",
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
