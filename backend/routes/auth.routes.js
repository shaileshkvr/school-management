import { Router } from 'express';

const router = Router();

router.route('/register');

router.route('/login');

router.route('/me');

router.route('/forgot-password');

router.route('/logout');

export default router;
