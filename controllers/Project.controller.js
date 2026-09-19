const projectService = require("../services/Project.service");
const { sendSuccess, sendError } = require("../utils/responseFormatter");
const { validateName, validateStatus } = require("../models/Project.model");

exports.createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(req.body, req.user);
    return sendSuccess(res, "Project created successfully", project, 201);
  } catch (err) {
    if (
      err.message.includes("already exists") ||
      err.message.includes("Company is required")
    ) {
      return sendError(res, err.message, null, 400);
    }
    return sendError(res, "Failed to create project", err, 500);
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await projectService.getAllProjects(
      req.user,
      req.query.companyId,
    );
    return sendSuccess(res, "Projects fetched successfully", projects, 200);
  } catch (err) {
    return sendError(res, "Failed to fetch projects", err, 500);
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(
      req.params.id,
      req.user,
    );
    return sendSuccess(res, "Project fetched successfully", project, 200);
  } catch (err) {
    if (err.message.includes("not found")) {
      return sendError(res, err.message, null, 404);
    }
    if (err.message.includes("outside your company")) {
      return sendError(res, err.message, null, 403);
    }
    return sendError(res, "Failed to fetch project", err, 500);
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { error } = validateName(req.body);
    if (error) {
      return sendError(res, error.details[0].message, null, 400);
    }
    const project = await projectService.updateProject(
      req.params.id,
      req.body.name,
      req.user,
    );
    return sendSuccess(res, "Project updated successfully", project, 200);
  } catch (err) {
    if (err.message.includes("not found")) {
      return sendError(res, err.message, null, 404);
    }
    if (err.message.includes("outside your company")) {
      return sendError(res, err.message, null, 403);
    }
    return sendError(res, "Failed to update project", err, 500);
  }
};

exports.updateProjectStatus = async (req, res) => {
  try {
    const { error } = validateStatus(req.body);
    if (error) {
      return sendError(res, error.details[0].message, null, 400);
    }
    const project = await projectService.updateProjectStatus(
      req.params.id,
      req.body.isActive,
      req.user,
    );
    return sendSuccess(
      res,
      "Project status updated successfully",
      project,
      200,
    );
  } catch (err) {
    if (err.message.includes("not found")) {
      return sendError(res, err.message, null, 404);
    }
    if (err.message.includes("outside your company")) {
      return sendError(res, err.message, null, 403);
    }
    return sendError(res, "Failed to update project status", err, 500);
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id, req.user);
    return sendSuccess(res, "Project deleted successfully", null, 200);
  } catch (err) {
    if (err.message.includes("not found")) {
      return sendError(res, err.message, null, 404);
    }
    if (err.message.includes("outside your company")) {
      return sendError(res, err.message, null, 403);
    }
    return sendError(res, "Failed to delete project", err, 500);
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await projectService.getMyProjects(req.user._id);
    return sendSuccess(res, "Projects fetched successfully", projects, 200);
  } catch (err) {
    return sendError(res, "Failed to fetch your projects", err, 500);
  }
};

exports.assignUsersToProject = async (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users)) {
      return sendError(res, "A valid users array is required.", null, 400);
    }
    const project = await projectService.assignUsersToProject(
      req.params.id,
      users,
      req.user,
    );
    return sendSuccess(
      res,
      "Users assigned to project successfully",
      project,
      200,
    );
  } catch (err) {
    if (
      err.message.includes("not found") ||
      err.message.includes("outside your company")
    ) {
      return sendError(res, err.message, null, err.status || 400);
    }
    return sendError(res, "Failed to assign users", err, 500);
  }
};
