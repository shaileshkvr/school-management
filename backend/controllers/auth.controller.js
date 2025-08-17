import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import Invite from '../models/invite.model.js';
import asynchandler from '../utility/asyncHandler.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utility/cloudinary.js';

const verifyInviteCode = asynchandler(async (req, res, next) => {
  const { inviteCode } = req.body;
  const invite = await Invite.findOne({ code: inviteCode, expiresAt: { $gt: new Date() } });
  if (!inviteCode) {
    return res.status(400).json({ message: 'Invite code is invalid or expired' });
  }
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