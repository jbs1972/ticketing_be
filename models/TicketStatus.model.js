const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketStatusSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Status name is required"],
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    color: {
      type: String,
      default: "",
      validate: {
        validator: (v) => v === "" || /^#([0-9A-Fa-f]{6})$/.test(v),
        message: "Color must be a valid hex code or empty (No Color)",
      },
    },
    sequence: {
      type: Number,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

ticketStatusSchema.index({ company: 1, name: 1 }, { unique: true });
ticketStatusSchema.index({ company: 1, sequence: 1 }, { unique: true });

module.exports = mongoose.model("TicketStatus", ticketStatusSchema);
