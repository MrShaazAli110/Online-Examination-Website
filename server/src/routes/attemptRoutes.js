import express from 'express';
import { attemptController } from '../controllers/attemptController.js';

const router = express.Router();

router.post('/start', attemptController.startAttempt);
router.post('/:id/violation', attemptController.logViolation);
router.post('/:id/submit', attemptController.submitAttempt);
router.get('/:id', attemptController.getAttemptResult);
router.get('/student/:email', attemptController.getStudentAttempts);

export default router;
