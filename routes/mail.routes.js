const express = require("express");
const router = express.Router();

const mailController = require("../controllers/mailController");

const upload = require("../middlewares/uploadMiddleware");

/*
POST /api/mail/send
*/

router.post(
  "/send",
  mailController.sendMail
);

module.exports = router;