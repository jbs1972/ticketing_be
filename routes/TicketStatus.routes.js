const express = require("express");
const auth = require("../middleware/Auth.middleware");
const admin = require("../middleware/Admin.middleware");

const {
  getAllStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
  reorderStatuses,
} = require("../controllers/TicketStatus.controller");

const router = express.Router();

router.route("/").get(auth, getAllStatuses).post(auth, admin, createStatus);

router.route("/reorder").put(auth, admin, reorderStatuses);

router
  .route("/:id")
  .put(auth, admin, updateStatus)
  .delete(auth, admin, deleteStatus);

module.exports = router;
