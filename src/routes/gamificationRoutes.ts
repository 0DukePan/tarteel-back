import { Router } from 'express';
import { gamificationController } from '../controllers/gamificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/badges', gamificationController.getBadges);
router.get('/xp-rewards', gamificationController.getXPRewards);
router.get('/levels', gamificationController.getLevels);
router.get('/leaderboard', gamificationController.getLeaderboard);

// Protected routes
router.get('/stats/:studentId', authenticate, gamificationController.getStats);
router.post('/award-xp', authenticate, gamificationController.awardXP);
router.post('/update-streak/:studentId', authenticate, gamificationController.updateStreak);

export default router;
