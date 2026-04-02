import { Router } from 'express';
import protect from '../middlewares/auth.middleware.js';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/dashboard', protect, getDashboardAnalytics);

export default router;
