const express = require("express");
const auth = require("../middleware/Auth.middleware");
const admin = require("../middleware/Admin.middleware");

const {
  getAllPriorities,
  createPriority,
  updatePriority,
  deletePriority,
} = require("../controllers/TicketPriority.controller");

const router = express.Router();

router.route("/").get(auth, getAllPriorities).post(auth, admin, createPriority);

router
  .route("/:id")
  .put(auth, admin, updatePriority)
  .delete(auth, admin, deletePriority);

module.exports = router;
