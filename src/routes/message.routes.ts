import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createMessageSchema, updateMessageSchema } from '../validators/message.validators';

const router = Router();

router.route('/')
  .post(authenticate, authorize('admin', 'teacher', 'parent'), validate(createMessageSchema), MessageController.createMessage)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), MessageController.getMessages);

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), MessageController.getMessageById)
  .put(authenticate, authorize('admin', 'teacher', 'parent'), validate(updateMessageSchema), MessageController.updateMessage)
  .delete(authenticate, authorize('admin'), MessageController.deleteMessage);

export const messageRoutes = router;

