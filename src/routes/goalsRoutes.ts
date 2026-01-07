import { Router } from 'express';
import { goalsController } from '../controllers/goalsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/categories', goalsController.getCategories);
router.get('/suggestions/:level', goalsController.getSuggestedGoals);

// Protected routes
router.post('/', authenticate, goalsController.createGoal);
router.get('/:studentId', authenticate, goalsController.getActiveGoals);
router.get('/:studentId/progress', authenticate, goalsController.getProgress);
router.put('/:goalId/progress', authenticate, goalsController.updateProgress);
router.post('/increment', authenticate, goalsController.incrementByCategory);
router.delete('/:studentId/:goalId', authenticate, goalsController.deleteGoal);

export default router;
