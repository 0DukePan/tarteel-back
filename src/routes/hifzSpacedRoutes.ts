import { Router } from 'express';
import { hifzController } from '../controllers/hifzController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/quality-ratings', hifzController.getQualityRatings);

// Protected routes
router.post('/add-verse', authenticate, hifzController.addVerse);
router.post('/add-range', authenticate, hifzController.addVerseRange);
router.get('/due/:studentId', authenticate, hifzController.getDueReviews);
router.post('/review', authenticate, hifzController.recordReview);
router.get('/progress/:studentId', authenticate, hifzController.getProgress);
router.get('/surah/:studentId/:surahNumber', authenticate, hifzController.getSurahProgress);

export default router;
