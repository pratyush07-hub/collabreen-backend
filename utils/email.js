const nodemailer = require("nodemailer");
require("dotenv").config()

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD, 
  },
});

async function sendOTP(subject, email, content) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    html: content,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email Sent");
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
}

async function sendEmailToUser(email, subject, content) {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      html: content,
    };
    await transporter.sendMail(mailOptions);
    console.log("Email Sent To User");
  } catch (err) {
    console.error("Error Sending Email", err);
  }
}

module.exports = {sendOTP,sendEmailToUser};
