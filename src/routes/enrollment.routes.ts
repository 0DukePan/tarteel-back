import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createEnrollmentSchema, updateEnrollmentSchema } from '../validators/enrollment.validators';

const router = Router();

router.route('/')
  .post(authenticate, authorize('admin', 'parent'), validate(createEnrollmentSchema), EnrollmentController.createEnrollment)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), EnrollmentController.getEnrollments);

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), EnrollmentController.getEnrollmentById)
  .put(authenticate, authorize('admin', 'parent'), validate(updateEnrollmentSchema), EnrollmentController.updateEnrollment)
  .delete(authenticate, authorize('admin'), EnrollmentController.deleteEnrollment);

export const enrollmentRoutes = router;
