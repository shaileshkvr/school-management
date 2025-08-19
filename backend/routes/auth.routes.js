import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import verifyJwt from '../middlewares/auth.middleware.js';
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

router.route('/verify-invite-code').post(verifyInviteCode);

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

// router.route('/forgot-password').patch(forgetPassword);

// // Secured Routes

// router.route('/get-access-token').get(getAccessToken);

// router.route('/reset-password').patch(verifyJwt, resetPassword);

// router.route('/logout').get(verifyJwt, logoutUser);

export default router;
