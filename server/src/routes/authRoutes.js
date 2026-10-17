import express from 'express';
import { authController } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin/make-examiner', authController.makeExaminer);
router.get('/profile', authController.getProfile);

export default router;
