const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketPrioritySchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Priority name is required"],
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

ticketPrioritySchema.index({ company: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("TicketPriority", ticketPrioritySchema);
