import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createAssignmentSchema, updateAssignmentSchema } from '../validators/assignment.validators';

const router = Router();

router.route('/')
  .post(authenticate, authorize('admin', 'teacher'), validate(createAssignmentSchema), AssignmentController.createAssignment)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), AssignmentController.getAssignments);

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), AssignmentController.getAssignmentById)
  .put(authenticate, authorize('admin', 'teacher'), validate(updateAssignmentSchema), AssignmentController.updateAssignment)
  .delete(authenticate, authorize('admin', 'teacher'), AssignmentController.deleteAssignment);

export const assignmentRoutes = router;

