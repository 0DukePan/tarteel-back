import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createComment, getComments, getCommentById, updateComment, deleteComment } from '../controllers/comment.controller';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.validators';

const router = express.Router();

router.route('/')
  .post(authenticate, authorize('admin', 'teacher', 'parent', 'student'), validate(createCommentSchema), createComment)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), getComments);

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), getCommentById)
  .put(authenticate, authorize('admin', 'teacher', 'parent', 'student'), validate(updateCommentSchema), updateComment)
  .delete(authenticate, authorize('admin', 'teacher'), deleteComment);

export default router;


