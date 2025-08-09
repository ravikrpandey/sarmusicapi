const {otpTemplate} = require('../node-mailer.js/email-template')
const nodemailer = require('nodemailer');
require('dotenv').config();

// Function to generate a 6-digit OTP
async function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
     port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT || '587',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// Function to send OTP email
async function sendOTPEmail(to, otp) {
    try {
      const htmlContent = otpTemplate(otp);
      const mailOptions = {
        from: `"SAR Music" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your OTP Code',
        html: htmlContent,
      };
  
      const info =  transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      // return false;
    }
  }

  module.exports = {
    sendOTPEmail,
    generateOTP
};