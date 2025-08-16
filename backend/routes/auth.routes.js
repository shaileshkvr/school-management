import { Router } from 'express';
import {upload} from '../middlewares/multer.middleware.js';
// import {register, login, getMe, forgotPassword, logout} from '../controllers/auth.controller.js';

const router = Router();

router.route('/register', /* auth controller fn */);

router.route('/login', /* auth controller fn */);

router.route('/me', /* auth controller fn */);

router.route('/forgot-password', /* auth controller fn */);

router.route('/logout', /* auth controller fn */);

export default router;
