// Responsible for creating SMTP transporter

const path = require("path");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

const environment = process.env.NODE_ENV || "dev";
const envPath = path.join(__dirname, `../.env.${environment}`);
dotenv.config({ path: envPath });

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

module.exports = transporter;