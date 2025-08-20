import { Router } from 'express';
import { sendEmail } from '../controllers/test.controller.js';

const router = Router();

router.route('/send-mail').post(sendEmail);

export default router;
