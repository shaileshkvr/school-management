import nodemailer from 'nodemailer';
import ApiError from '../ApiError.js';
import templateEmail from './emailTemplate.js';
import dotenv from 'dotenv';

dotenv.config();

// this transporter is used to send emails, he is the postman
const transPorter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (name, to, subject) => {
  // sendMail function below comes from nodemailer
  try {
    const info = await transPorter.sendMail({
      to,
      from: `School Management <${process.env.EMAIL_USER}>`,
      subject,
      html: templateEmail({
        user: name,
        purpose: 'test the email functionality',
        url: 'https://www.google.com',
        urlText: 'Go to Google',
        header: 'Test Email from School Management',
      }),
    });

    return info;
  } catch (error) {
    throw new ApiError(500, 'Failed to send email', error);
  }
};

export default sendMail;
