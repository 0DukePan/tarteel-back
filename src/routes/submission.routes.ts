import { Router } from 'express';
import { SubmissionController } from '../controllers/submission.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createSubmissionSchema, updateSubmissionSchema } from '../validators/submission.validators';

const router = Router();

router.route('/')
  .post(authenticate, authorize('admin', 'student'), validate(createSubmissionSchema), SubmissionController.createSubmission)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), SubmissionController.getSubmissions);

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), SubmissionController.getSubmissionById)
  .put(authenticate, authorize('admin', 'student'), validate(updateSubmissionSchema), SubmissionController.updateSubmission)
  .delete(authenticate, authorize('admin'), SubmissionController.deleteSubmission);

export const submissionRoutes = router;

