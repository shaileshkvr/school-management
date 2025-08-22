import { Router } from 'express';
import { sendEmail } from '../controllers/test.controller.js';

const router = Router();

router
  .route('/send-mail')
  .post(sendEmail)
  .get((_, res) => res.status(200).json({ service: 'email service', status: 'running' }));

export default router;
