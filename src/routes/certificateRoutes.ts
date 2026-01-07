import { Router } from 'express';
import { certificateController } from '../controllers/certificateController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected routes - require authentication
router.post('/generate', authenticate, certificateController.generateCertificate);
router.post('/surah', authenticate, certificateController.generateSurahCertificate);
router.post('/juz', authenticate, certificateController.generateJuzCertificate);
router.post('/hafiz', authenticate, certificateController.generateHafizCertificate);

// Get certificates
router.get('/student/:studentId', authenticate, certificateController.getStudentCertificates);
router.get('/:id', authenticate, certificateController.getCertificateById);
router.get('/:id/html', certificateController.getCertificateHTML); // Public for easy sharing/printing

export default router;
