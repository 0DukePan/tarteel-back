import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import {
  createBadge,
  getBadges,
  getBadgeById,
  updateBadge,
  deleteBadge,
  awardBadgeToStudent,
  getStudentBadges,
  revokeBadgeFromStudent,
} from '../controllers/badge.controller';
import { createBadgeSchema, updateBadgeSchema, awardBadgeSchema } from '../validators/badge.validators';

const router = express.Router();

// Badge management (Admin only)
router.route('/')
  .post(authenticate, authorize('admin'), validate(createBadgeSchema), createBadge)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), getBadges); // All roles can view badges

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), getBadgeById)
  .put(authenticate, authorize('admin'), validate(updateBadgeSchema), updateBadge)
  .delete(authenticate, authorize('admin'), deleteBadge);

// Award and revoke badges (Admin/Teacher only)
router.post('/award', authenticate, authorize('admin', 'teacher'), validate(awardBadgeSchema), awardBadgeToStudent);
router.get('/student/:studentId', authenticate, authorize('admin', 'teacher', 'parent', 'student'), getStudentBadges); // Students can view their own badges, parents their children's
router.delete('/revoke/:id', authenticate, authorize('admin', 'teacher'), revokeBadgeFromStudent);

export default router;

