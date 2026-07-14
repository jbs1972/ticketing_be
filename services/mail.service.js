const transporter = require("../config/mail.config");

exports.sendMail = async (mailData) => {

  const mailOptions = {

    from: process.env.MAIL_FROM,

    to: mailData.to,

    subject: mailData.subject,

    text: mailData.message
  };

  return await transporter.sendMail(mailOptions);
};