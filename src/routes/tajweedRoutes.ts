import { Router } from 'express';
import { tajweedController } from '../controllers/tajweedController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public demo endpoint (for testing)
router.post('/demo', tajweedController.getDemoAnalysis);

// Protected routes (require authentication)
router.post(
    '/analyze',
    authenticate,
    tajweedController.uploadMiddleware,
    tajweedController.analyzeRecitation
);

router.get(
    '/result/:id',
    authenticate,
    tajweedController.getAnalysisResult
);

export default router;
