const express = require("express");
const auth = require("../middleware/Auth.middleware");
const admin = require("../middleware/Admin.middleware");
const {
  createProject,
  getAllProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  deleteProject,
  assignUsersToProject,
} = require("../controllers/Project.controller");
const { validate } = require("../models/Project.model");
const router = express.Router();

router.get("/", auth, admin, getAllProjects);
router.get("/mine", auth, getMyProjects);
router.get("/:id", auth, admin, getProjectById);

router.post(
  "/",
  auth,
  admin,
  (req, res, next) => {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        data: null,
        status: "error",
      });
    }
    next();
  },
  createProject,
);

router.patch("/:id", auth, admin, updateProject);
router.patch("/:id/status", auth, admin, updateProjectStatus);
router.delete("/:id", auth, admin, deleteProject);
router.post("/:id/users", auth, admin, assignUsersToProject);

module.exports = router;
