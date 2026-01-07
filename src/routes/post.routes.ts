import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createPost, getPosts, getPostById, updatePost, deletePost } from '../controllers/post.controller';
import { createPostSchema, updatePostSchema } from '../validators/post.validators';

const router = express.Router();

router.route('/')
  .post(authenticate, authorize('admin', 'teacher', 'parent', 'student'), validate(createPostSchema), createPost)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), getPosts);

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), getPostById)
  .put(authenticate, authorize('admin', 'teacher', 'parent', 'student'), validate(updatePostSchema), updatePost)
  .delete(authenticate, authorize('admin', 'teacher'), deletePost);

export default router;


