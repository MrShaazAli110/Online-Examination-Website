import express from 'express';
import { examController } from '../controllers/examController.js';

const router = express.Router();

router.get('/', examController.getExams);
router.get('/:id', examController.getExamById);
router.post('/', examController.createExam);
router.put('/:id', examController.updateExam);
router.delete('/:id', examController.deleteExam);

// Question routes for exam
router.post('/:id/questions', examController.addQuestion);
router.delete('/questions/:id', examController.deleteQuestion);

export default router;
