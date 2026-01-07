import { Router } from 'express';
import { ramadanController } from '../controllers/ramadanController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/current', ramadanController.getCurrentChallenge);
router.get('/schedule', ramadanController.getSchedule);
router.get('/:challengeId/leaderboard', ramadanController.getLeaderboard);

// Protected routes
router.post('/join', authenticate, ramadanController.joinChallenge);
router.post('/complete-juz', authenticate, ramadanController.completeJuz);
router.get('/:challengeId/progress/:studentId', authenticate, ramadanController.getProgress);

export default router;
