import { Router } from 'express';
import { schoolController } from '../controllers/schoolController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/pricing', schoolController.getPricing);

// Protected routes
router.post('/', authenticate, schoolController.registerSchool);
router.get('/', authenticate, schoolController.getAllSchools);
router.get('/:id', authenticate, schoolController.getSchool);
router.post('/:id/members', authenticate, schoolController.addMember);
router.delete('/:id/members/:userId', authenticate, schoolController.removeMember);
router.get('/:id/members', authenticate, schoolController.getMembers);
router.get('/:id/analytics', authenticate, schoolController.getAnalytics);
router.get('/:id/license-status', authenticate, schoolController.getLicenseStatus);
router.put('/:id/upgrade', authenticate, schoolController.upgradeTier);

export default router;
