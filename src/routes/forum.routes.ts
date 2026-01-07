import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createForum, getAllForums, getForumById, updateForum, deleteForum } from '../controllers/forum.controller';
import { createForumSchema, updateForumSchema } from '../validators/forum.validators';

const router = express.Router();

router.route('/')
  .post(authenticate, authorize('admin'), validate(createForumSchema), createForum)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), getAllForums);

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), getForumById)
  .put(authenticate, authorize('admin'), validate(updateForumSchema), updateForum)
  .delete(authenticate, authorize('admin'), deleteForum);

export default router;


