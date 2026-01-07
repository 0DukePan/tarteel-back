import { Router } from 'express';
import { GradeController } from '../controllers/grade.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createGradeSchema, updateGradeSchema } from '../validators/grade.validators';

const router = Router();

router.route('/')
  .post(authenticate, authorize('admin', 'teacher'), validate(createGradeSchema), GradeController.createGrade)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), GradeController.getGrades);

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), GradeController.getGradeById)
  .put(authenticate, authorize('admin', 'teacher'), validate(updateGradeSchema), GradeController.updateGrade)
  .delete(authenticate, authorize('admin'), GradeController.deleteGrade);

export const gradeRoutes = router;

