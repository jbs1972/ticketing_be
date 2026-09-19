const { Company } = require("../models/Company.model");
const CounterModel = require("../models/Counter.model");
const ticketStatusService = require("./TicketStatus.service");
const ticketPriorityService = require("./TicketPriority.service");
const bcrypt = require("bcrypt");
const { User } = require("../models/User.model");
const { toTitleCase } = require("../utils/textNormalizer");

const SALT_ROUNDS = 12;

const generateCompanyId = async () => {
  const counter = await CounterModel.findOneAndUpdate(
    { _id: "companyId" },
    { $inc: { seq: 1 } },
    { new: true },
  );
  if (counter) {
    return String(counter.seq);
  }
  const newCounter = await CounterModel.create({ _id: "companyId", seq: 1001 });
  return String(newCounter.seq);
};

exports.createCompany = async (companyData) => {
  const companyName = toTitleCase(companyData.name);
  const existing = await Company.findOne({ name: companyName });
  if (existing) {
    throw new Error("A company with this name already exists.");
  }

  const companyId = await generateCompanyId();
  const company = new Company({ companyId, name: companyName });
  await company.save();

  await ticketStatusService.ensureDefaultStatuses(company._id);
  await ticketPriorityService.ensureDefaultPriorities(company._id);

  // Default Company Admin: dell -> dell.admin@yopmail.com / Dell#@dmin1234
  const lowerName = companyData.name.trim().toLowerCase();
  const capitalName = toTitleCase(companyData.name);
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(`${capitalName}#@dmin1234`, salt);

  await User.create({
    name: `${capitalName} Admin`,
    email: `${lowerName}.admin@yopmail.com`,
    password: hashedPassword,
    role: "admin",
    company: company._id,
    isActive: true,
  });

  return company;
};

exports.getAllCompanies = async () => {
  return await Company.find().sort({ createdDate: 1 });
};

exports.getCompanyById = async (id) => {
  const company = await Company.findById(id);
  if (!company) {
    throw new Error("Company not found.");
  }
  return company;
};

exports.updateCompanyName = async (id, name) => {
  const company = await exports.getCompanyById(id);
  company.name = toTitleCase(name);
  await company.save();
  return company;
};

exports.updateCompanyStatus = async (id, isActive) => {
  const company = await exports.getCompanyById(id);
  company.isActive = isActive;
  await company.save();
  return company;
};
