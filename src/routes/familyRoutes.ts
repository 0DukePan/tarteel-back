import { Router } from 'express';
import { familyController } from '../controllers/familyController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/pricing', familyController.getPricing);
router.get('/pricing/calculate', familyController.calculatePricing);

// Protected routes
router.get('/children/:parentId', authenticate, familyController.getChildren);
router.get('/stats/:parentId', authenticate, familyController.getFamilyStats);
router.get('/progress/:parentId', authenticate, familyController.getAllChildrenProgress);

// Scholarship routes
router.post('/scholarship/apply', authenticate, familyController.applyForScholarship);
router.get('/scholarship/status/:parentId', authenticate, familyController.getScholarshipStatus);
router.get('/scholarship/pending', authenticate, familyController.getPendingScholarships);
router.put('/scholarship/review/:applicationId', authenticate, familyController.reviewScholarship);

export default router;
