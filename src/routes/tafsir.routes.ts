import { Router } from 'express';
import { TafsirController } from '../controllers/tafsir.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const tafsirController = new TafsirController();

router.get('/translations', authenticate, authorize('student', 'admin', 'teacher'), tafsirController.getTranslation);
router.get('/tafsirs', authenticate, authorize('student', 'admin', 'teacher'), tafsirController.getTafsir);
router.get('/word-analysis', authenticate, authorize('student', 'admin', 'teacher'), tafsirController.getWordAnalysis);
router.get('/editions', authenticate, authorize('student', 'admin', 'teacher'), tafsirController.getAvailableEditions);

export default router;
