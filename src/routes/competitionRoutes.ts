import { Router } from 'express';
import { competitionController } from '../controllers/competitionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', competitionController.getCompetitions);
router.get('/:id', competitionController.getCompetition);
router.get('/:id/rankings', competitionController.getRankings);

// Protected routes
router.post('/', authenticate, competitionController.createCompetition);
router.post('/:id/join', authenticate, competitionController.joinCompetition);
router.post('/:id/submit', authenticate, competitionController.submitEntry);
router.get('/student/:studentId', authenticate, competitionController.getStudentCompetitions);
router.post('/:id/finalize', authenticate, competitionController.finalizeCompetition);
router.post('/seed', authenticate, competitionController.seedCompetitions);

export default router;
