const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Generic counter collection, used to atomically generate sequential ticket codes
const counterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 100000 },
  },
  { versionKey: false },
);

module.exports = mongoose.model("Counter", counterSchema);
