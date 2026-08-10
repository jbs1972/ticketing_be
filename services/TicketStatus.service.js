const TicketStatusModel = require("../models/TicketStatus.model");
const TicketModel = require("../models/Ticket.model");

const DEFAULT_STATUSES = [
  { name: "Open", color: "#2563eb" },
  { name: "In Progress", color: "#d97706" },
  { name: "Resolved", color: "#16a34a" },
];

exports.ensureDefaultStatuses = async () => {
  const count = await TicketStatusModel.countDocuments();
  if (count > 0) return;

  await TicketStatusModel.insertMany(DEFAULT_STATUSES);
  console.log("✅ Default ticket statuses created");
};

exports.getAllStatuses = async () => {
  return await TicketStatusModel.find().sort({ createdAt: 1 });
};

exports.createStatus = async (data) => {
  return await TicketStatusModel.create(data);
};

exports.updateStatus = async (id, data) => {
  return await TicketStatusModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

exports.deleteStatus = async (id) => {
  const status = await TicketStatusModel.findById(id);

  if (!status) {
    const error = new Error("Status not found");
    error.status = 404;
    throw error;
  }

  const inUse = await TicketModel.exists({ status: status.name });

  if (inUse) {
    const error = new Error(
      "Cannot delete a status that is currently assigned to tickets.",
    );
    error.status = 400;
    throw error;
  }

  await status.deleteOne();

  return status;
};
