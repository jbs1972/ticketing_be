const TicketStatusModel = require("../models/TicketStatus.model");
const TicketModel = require("../models/Ticket.model");
const { Company } = require("../models/Company.model");
const { toTitleCase } = require("../utils/textNormalizer");

const DEFAULT_STATUSES = [
  { name: "New", color: "#48f542", sequence: 0, isDefault: true },
  { name: "Allocate", color: "#0d9488", sequence: 1, isDefault: true },
];

const badRequest = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

exports.ensureDefaultStatuses = async (companyId) => {
  const count = await TicketStatusModel.countDocuments({ company: companyId });
  if (count === 0) {
    await TicketStatusModel.insertMany(
      DEFAULT_STATUSES.map((s) => ({ ...s, company: companyId })),
    );
  }
};

exports.ensureAllCompaniesHaveStatuses = async () => {
  const companies = await Company.find();
  for (const company of companies) {
    await exports.ensureDefaultStatuses(company._id);
  }
  const removed = await TicketStatusModel.deleteMany({
    $or: [{ company: { $exists: false } }, { company: null }],
  });
  console.log(
    `✅ Default statuses verified for ${companies.length} company(ies), ${removed.deletedCount} legacy global status(es) removed`,
  );
};

exports.getAllStatuses = async (companyId) => {
  return await TicketStatusModel.find({ company: companyId }).sort({
    sequence: 1,
  });
};

exports.getStatusById = async (id) => {
  return await TicketStatusModel.findById(id);
};

exports.createStatus = async (companyId, data) => {
  const top = await TicketStatusModel.findOne({ company: companyId }).sort({
    sequence: -1,
  });
  return await TicketStatusModel.create({
    name: toTitleCase(data.name),
    color: data.color || "",
    company: companyId,
    sequence: top ? top.sequence + 1 : 0,
  });
};

exports.updateStatus = async (id, data) => {
  const status = await TicketStatusModel.findById(id);
  if (!status) return null;
  if (status.isDefault) {
    throw badRequest("The default status cannot be modified.");
  }
  status.name = data.name ? toTitleCase(data.name) : status.name;
  status.color = data.color ?? status.color;
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
    throw badRequest("The default status cannot be deleted.");
  }
  const inUse = await TicketModel.exists({
    company: status.company,
    status: status.name,
  });
  if (inUse) {
    throw badRequest(
      "Cannot delete a status that is currently assigned to tickets.",
    );
  }
  await status.deleteOne();
  return status;
};

exports.reorderStatuses = async (companyId, orderedIds) => {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw badRequest("A sequence order is required.");
  }
  const statuses = await TicketStatusModel.find({ company: companyId });
  if (orderedIds.length !== statuses.length) {
    throw badRequest("The sequence must include every status of the company.");
  }
  const byId = new Map(statuses.map((s) => [String(s._id), s]));
  const ordered = orderedIds.map((id) => byId.get(String(id)));
  if (ordered.some((s) => !s)) {
    throw badRequest("Unknown status in sequence.");
  }
  const locked = statuses
    .filter((s) => s.isDefault)
    .sort((a, b) => a.sequence - b.sequence);
  for (let i = 0; i < locked.length; i++) {
    if (String(ordered[i]._id) !== String(locked[i]._id)) {
      throw badRequest("New and Allocate must stay first in the sequence.");
    }
  }
  for (let i = 0; i < ordered.length; i++) {
    ordered[i].sequence = i;
  }
  await Promise.all(ordered.map((s) => s.save()));
  return await exports.getAllStatuses(companyId);
};

// Users: immediate next status only. Admins/Super Admins: any forward move, never backward.
exports.validateStatusChange = async (
  companyId,
  currentName,
  newName,
  role,
) => {
  if (currentName === newName) return;
  const statuses = await TicketStatusModel.find({ company: companyId }).sort({
    sequence: 1,
  });
  const currentIndex = statuses.findIndex((s) => s.name === currentName);
  const newIndex = statuses.findIndex((s) => s.name === newName);
  if (newIndex === -1) {
    throw badRequest(`Unknown status "${newName}".`);
  }
  if (newIndex <= currentIndex) {
    throw badRequest("Status can only move forward in the sequence.");
  }
  if (role === "user" && newIndex !== currentIndex + 1) {
    throw badRequest(
      "You can only move a ticket to the next status in the sequence.",
    );
  }
};
