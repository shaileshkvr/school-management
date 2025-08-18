import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import Invite from '../models/invite.model.js';
import asynchandler from '../utility/asyncHandler.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utility/cloudinary.js';

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
  if (!inviteCode) {
    return res.status(400).json({ message: 'Invite code is required' });
  }

  const invite = await Invite.findOne({ code: inviteCode });
  if (!invite || !invite.isValid) {
    return res.status(404).json({ message: 'Invalid or Expired Invite Code' });
  }

  // Verified invite code, return allowed roles
  // Once frontend get success and allowed roles, it can redirect user to registration page
  // user fill deatails and submit registration form -> hit registerUser api
});

const registerUser = asynchandler(async (req, res) => {});

const loginUser = asynchandler(async (req, res) => {});

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
