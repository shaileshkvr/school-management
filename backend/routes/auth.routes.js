import { Router } from 'express';
import {verifyJwt, validateCode} from '../middlewares/auth.middleware.js';
import {
  registerUser,
  loginUser,
  getAccessToken,
  resetPassword,
  forgetPassword,
  logoutUser,
} from '../controllers/auth.controller.js';

const router = Router();

router.route('/register').post(validateCode, registerUser);

router.route('/login').post(loginUser);

router.route('/forgot-password').post(forgetPassword);

// // Secured Routes

router.route('/access-token').post(getAccessToken);

router.route('/reset-password').patch(verifyJwt, validateCode, resetPassword);

// router.route('/logout').post(verifyJwt, logoutUser);

export default router;
