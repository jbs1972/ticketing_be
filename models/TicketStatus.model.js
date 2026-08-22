const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketStatusSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Status name is required"],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    color: {
      type: String,
      required: [true, "Status color is required"],
      match: [/^#([0-9A-Fa-f]{6})$/, "Color must be a valid hex code"],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("TicketStatus", ticketStatusSchema);
