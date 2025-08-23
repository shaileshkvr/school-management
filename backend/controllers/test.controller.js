import asyncHandler from '../utils/asyncHandler.js';
import sendMail from '../utils/email/sendMail.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const sendEmail = asyncHandler(async (req, res) => {
  const { name, to, subject } = req.body;
  if (!to || !subject) {
    throw new ApiError(400, 'To, subject, and html content are required for sending an email');
  }
  try {
    const response = await sendMail(name, to, subject);
    return res.status(200).json(new ApiResponse(200, 'Email sent successfully', response));
  } catch (error) {
    throw new ApiError(500, 'Test-controller: utils function sendMail error', error);
  }
});

export { sendEmail };
