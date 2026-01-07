import { Router } from 'express';
import { videoLessonController } from '../controllers/videoLessonController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', videoLessonController.getLessons);
router.get('/categories', videoLessonController.getCategories);
router.get('/:id', videoLessonController.getLesson);

// Protected routes
router.post('/', authenticate, videoLessonController.createLesson);
router.post('/:id/progress', authenticate, videoLessonController.trackProgress);
router.get('/progress/:studentId', authenticate, videoLessonController.getStudentProgress);
router.post('/seed', authenticate, videoLessonController.seedLessons);

export default router;
