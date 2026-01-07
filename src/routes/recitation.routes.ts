import { Router } from 'express';
import { RecitationController } from '../controllers/recitation.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const recitationController = new RecitationController();

router.post('/', authenticate, authorize('student'), recitationController.uploadAudio, recitationController.createRecitation);
router.get('/:id', authenticate, authorize('student', 'admin'), recitationController.getRecitationById);
router.get('/student/:studentId', authenticate, authorize('student', 'admin'), recitationController.getRecitationsByStudentId);
router.put('/:id', authenticate, authorize('student', 'admin'), recitationController.updateRecitation);
router.delete('/:id', authenticate, authorize('student', 'admin'), recitationController.deleteRecitation);

export default router;
