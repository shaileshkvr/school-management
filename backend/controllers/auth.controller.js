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

  const invite = await Invite.findOne({ code: inviteCode, expiresAt: { $gt: new Date() } });
  if (!invite) {
    return res.status(400).json({ message: 'Invite code is invalid or expired' });
  }

  // Verified invite code, return allowed roles
  // Once frontend get success and allowed roles, it can redirect user to registration page
  // user fill deatails and submit registration form -> hit registerUser api
});

const registerUser = asynchandler(async (req, res) => {});

const loginUser = asynchandler(async (req, res) => {});

const forgetPassword = asynchandler(async (req, res) => {});

// Secured Routes

const logoutUser = asynchandler(async (req, res) => {});

const resetPassword = asynchandler(async (req, res) => {});

const getAccessToken = asynchandler(async (req, res) => {});

// Exports
export { verifyInviteCode, registerUser };
