const { Project } = require("../models/Project.model");
const { Company } = require("../models/Company.model");
const { User } = require("../models/User.model");
const CounterModel = require("../models/Counter.model");
const { toTitleCase } = require("../utils/textNormalizer");

// Company-scoped sequential project IDs, starting at 1001
const generateProjectId = async (companyObjectId) => {
  const company = await Company.findById(companyObjectId).select("companyId");
  const companyId = company.companyId;
  const counterId = `projectId:${companyId}`;
  const counter = await CounterModel.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true },
  );
  if (counter) {
    return String(counter.seq);
  }
  const newCounter = await CounterModel.create({ _id: counterId, seq: 1001 });
  return String(newCounter.seq);
};

exports.createProject = async (projectData, requester) => {
  const company =
    requester.role === "admin" ? requester.company : projectData.company;
  if (!company) {
    throw new Error(
      "Company is required when creating a project as Super Admin.",
    );
  }
  const projectName = toTitleCase(projectData.name);
  const existing = await Project.findOne({ company, name: projectName });
  if (existing) {
    throw new Error("A project with this name already exists in this company.");
  }
  const projectId = await generateProjectId(company);
  const project = new Project({ projectId, name: projectName, company });
  await project.save();
  return project;
};

exports.getAllProjects = async (requester, companyId) => {
  const filter = {};
  if (requester.role === "admin") {
    filter.company = requester.company;
  } else if (requester.role === "superadmin" && companyId) {
    filter.company = companyId;
  }
  return await Project.find(filter).sort({ createdDate: 1 });
};

exports.getProjectById = async (id, requester) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new Error("Project not found.");
  }
  if (
    requester.role === "admin" &&
    String(project.company) !== String(requester.company)
  ) {
    throw new Error("You cannot access projects outside your company.");
  }
  return project;
};

exports.updateProject = async (id, name, requester) => {
  const project = await exports.getProjectById(id, requester);
  project.name = toTitleCase(name);
  await project.save();
  return project;
};

exports.updateProjectStatus = async (id, isActive, requester) => {
  const project = await exports.getProjectById(id, requester);
  project.isActive = isActive;
  await project.save();
  return project;
};

exports.deleteProject = async (id, requester) => {
  const project = await exports.getProjectById(id, requester);
  await project.deleteOne();
  return project;
};

exports.getMyProjects = async (userId) => {
  const user = await User.findById(userId).select("projects");
  if (!user?.projects?.length) {
    return [];
  }
  return await Project.find({ _id: { $in: user.projects } }).sort({
    createdDate: 1,
  });
};

exports.isUserAssignedToProject = async (userId, projectId) => {
  const user = await User.findById(userId).select("projects");
  return !!user?.projects?.some((p) => String(p) === String(projectId));
};

exports.assignUsersToProject = async (projectId, userIds, requester) => {
  const project = await exports.getProjectById(projectId, requester);
  const currentUsers = await User.find({ projects: projectId });
  const toRemove = currentUsers.filter((u) => !userIds.includes(String(u._id)));
  for (const user of toRemove) {
    user.projects = user.projects.filter(
      (p) => String(p) !== String(projectId),
    );
    await user.save();
  }
  await User.updateMany(
    { _id: { $in: userIds }, projects: { $ne: projectId } },
    { $push: { projects: projectId } },
  );
  return project;
};
