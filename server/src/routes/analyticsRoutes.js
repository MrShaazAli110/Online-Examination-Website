import express from 'express';
import { analyticsController } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/dashboard', analyticsController.getDashboardOverview);
router.get('/exam/:examId', analyticsController.getExamAnalytics);

export default router;
