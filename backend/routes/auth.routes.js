import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import {
  verifyInviteCode,
  registerUser,
  loginUser,
  getAccessToken,
  resetPassword,
  forgetPassword,
  logoutUser,
} from '../controllers/auth.controller.js';

const router = Router();

router.route('/verify-invite-code', verifyInviteCode);

router.route('/register', registerUser);

router.route('/login' /* auth controller fn */);

router.route('/forgot-password' /* auth controller fn */);

// Secured Routes

router.route('/reset-password' /* auth controller fn */);

router.route('/get-access-token' /* auth controller fn */);

router.route('/logout' /* auth controller fn */);

export default router;
