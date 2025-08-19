import jwt from 'jsonwebtoken';
import ApiError from '../utility/ApiError.js';
import ApiResponse from '../utility/ApiResponse.js';
import User from '../models/user.model.js';
import Invite from '../models/invite.model.js';
import asynchandler from '../utility/asyncHandler.js';
import { generateUniqueUsername } from '../utility/uniqueCode.js';

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'generateAccessAndRefreshTokens: Something went wrong while generating tokens'
    );
  }
};

const verifyInviteCode = asynchandler(async (req, res, next) => {
  const { inviteCode } = req.body;

  // Validate invite code
  if (!inviteCode) {
    return res.status(400).json({ message: 'Invite code is required' });
  }

  const invite = await Invite.findOne({ code: inviteCode });

  if (!invite || !invite.isActive) {
    return res.status(404).json({ message: 'Invalid or Expired Invite Code' });
  }

  return res.status(200).json(new ApiResponse(200, { role: invite.role }, 'Invite code is valid'));
});

const registerUser = asynchandler(async (req, res) => {
  const {
    inviteCode,
    firstName,
    lastName,
    email,
    password,
    adhar,
    phone,
    dateOfBirth,
    bloodGroup,
    grade,
  } = req.body;

  // Validate invite code
  const invite = await Invite.findOne({ code: inviteCode });
  if (!invite || !invite.isActive) {
    throw new ApiError(400, 'Invalid or expired invite code');
  }

  // Mandatory fields (base check)
  if (!firstname || !email || !password || !adhar || !phone) {
    throw new ApiError(400, 'All fields are required');
  }

  // Role-based check
  if (invite.role === 'student' && (!grade || !dateOfBirth)) {
    throw new ApiError(400, 'Both Date-of-birth and Grade are required for students');
  }

  // Aadhaar uniqueness
  const existingUser = await User.findOne({ adhar });
  if (existingUser) {
    throw new ApiError(400, 'User with this Aadhaar number already exists');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    username: generateUniqueUsername(fullName, User),
    adhar,
    dateOfBirth: dateOfBirth || null,
    email: email.toLowerCase().trim(),
    phone,
    bloodGroup: bloodGroup || '',
    password,
    grade: grade || null,
    roles: [invite.role],
  });

  if (!user) {
    throw new ApiError(500, 'Something went wrong while registering user');
  }

  // Mark invite as used
  await invite.markUsed();

  // Cleanup sensitive fields
  const userObj = user.toObject();
  delete userObj.password;

  return res.status(201).json(new ApiResponse(201, 'User registered successfully', userObj));
});

const loginUser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body;
  if ((!username && !email) || !password) {
    throw new ApiError(400, 'Username/Email and Password are required');
  }

  // Build query
  const query = {};
  if (username) query.username = username.toLowerCase().trim();
  if (email) query.email = email.toLowerCase().trim();

  const user = await User.findOne(query).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Token generation
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'Strict',
  };

  return res
    .status(200)
    .cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }) // days * hours * minutes * seconds * milliseconds
    .cookie('accessToken', accessToken, cookieOptions)
    .json(new ApiResponse(200, { user: userObj }, 'Login successful'));
});

const forgetPassword = asynchandler(async (req, res) => {});

// Authentication required

const getAccessToken = asynchandler(async (req, res) => {});

const resetPassword = asynchandler(async (req, res) => {});

const logoutUser = asynchandler(async (req, res) => {});

export {
  verifyInviteCode,
  registerUser,
  loginUser,
  forgetPassword,
  logoutUser,
  resetPassword,
  getAccessToken,
};
