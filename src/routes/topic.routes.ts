import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createTopic, getTopics, getTopicById, updateTopic, deleteTopic } from '../controllers/topic.controller';
import { createTopicSchema, updateTopicSchema } from '../validators/topic.validators';

const router = express.Router();

router.route('/')
  .post(authenticate, authorize('admin', 'teacher', 'parent', 'student'), validate(createTopicSchema), createTopic)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), getTopics);

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), getTopicById)
  .put(authenticate, authorize('admin', 'teacher', 'parent', 'student'), validate(updateTopicSchema), updateTopic)
  .delete(authenticate, authorize('admin', 'teacher'), deleteTopic);

export default router;


