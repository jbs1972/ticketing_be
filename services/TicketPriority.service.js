const TicketPriorityModel = require("../models/TicketPriority.model");
const TicketModel = require("../models/Ticket.model");
const { Company } = require("../models/Company.model");
const { toTitleCase } = require("../utils/textNormalizer");

const DEFAULT_PRIORITIES = ["Default", "Normal"];

exports.ensureDefaultPriorities = async (companyId) => {
  const count = await TicketPriorityModel.countDocuments({
    company: companyId,
  });
  if (count === 0) {
    await TicketPriorityModel.insertMany(
      DEFAULT_PRIORITIES.map((name) => ({
        name,
        company: companyId,
        isDefault: true,
      })),
    );
  }
};

exports.ensureAllCompaniesHavePriorities = async () => {
  const companies = await Company.find();
  for (const company of companies) {
    await exports.ensureDefaultPriorities(company._id);
  }
  console.log(
    `✅ Default priorities verified for ${companies.length} company(ies)`,
  );
};

exports.getAllPriorities = async (companyId) => {
  return await TicketPriorityModel.find({ company: companyId }).sort({
    createdAt: 1,
  });
};

exports.createPriority = async (companyId, data) => {
  return await TicketPriorityModel.create({
    name: toTitleCase(data.name),
    company: companyId,
  });
};

exports.updatePriority = async (id, data) => {
  const priority = await TicketPriorityModel.findById(id);
  if (!priority) return null;
  priority.name = data.name ? toTitleCase(data.name) : priority.name;
  await priority.save();
  return priority;
};

exports.deletePriority = async (id) => {
  const priority = await TicketPriorityModel.findById(id);
  if (!priority) {
    const error = new Error("Priority not found");
    error.status = 404;
    throw error;
  }
  if (priority.isDefault) {
    const error = new Error("The default priority cannot be deleted.");
    error.status = 400;
    throw error;
  }
  const inUse = await TicketModel.exists({
    company: priority.company,
    priority: priority.name,
  });
  if (inUse) {
    const error = new Error(
      "Cannot delete a priority that is currently assigned to tickets.",
    );
    error.status = 400;
    throw error;
  }
  await priority.deleteOne();
  return priority;
};
