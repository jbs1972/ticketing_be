const TicketStatusModel = require("../models/TicketStatus.model");
const TicketModel = require("../models/Ticket.model");

const DEFAULT_STATUSES = [
  { name: "New", color: "#48f542", isDefault: true },
  { name: "Open", color: "#2563eb" },
  { name: "In Progress", color: "#d97706" },
  { name: "Resolved", color: "#16a34a" },
];

exports.ensureDefaultStatuses = async () => {
  const count = await TicketStatusModel.countDocuments();

  if (count === 0) {
    await TicketStatusModel.insertMany(DEFAULT_STATUSES);
    console.log("✅ Default ticket statuses created");
    return;
  }

  const hasNewStatus = await TicketStatusModel.exists({ name: "New" });

  if (!hasNewStatus) {
    await TicketStatusModel.create({
      name: "New",
      color: "#48f542",
      isDefault: true,
    });
    console.log("✅ Default 'New' status added");
  }
};

exports.getAllStatuses = async () => {
  return await TicketStatusModel.find().sort({ createdAt: 1 });
};

exports.createStatus = async (data) => {
  return await TicketStatusModel.create(data);
};

exports.updateStatus = async (id, data) => {
  const status = await TicketStatusModel.findById(id);

  if (!status) return null;

  if (status.isDefault) {
    const error = new Error("The default status cannot be modified.");
    error.status = 400;
    throw error;
  }

  Object.assign(status, data);
  await status.save();

  return status;
};

exports.deleteStatus = async (id) => {
  const status = await TicketStatusModel.findById(id);

  if (!status) {
    const error = new Error("Status not found");
    error.status = 404;
    throw error;
  }

  if (status.isDefault) {
    const error = new Error("The default status cannot be deleted.");
    error.status = 400;
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
