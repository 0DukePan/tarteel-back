import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createCourseSchema, updateCourseSchema } from '../validators/course.validators';

const router = Router();

router.route('/')
  .post(authenticate, authorize('admin', 'teacher'), validate(createCourseSchema), CourseController.createCourse)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), CourseController.getCourses);

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), CourseController.getCourseById)
  .put(authenticate, authorize('admin', 'teacher'), validate(updateCourseSchema), CourseController.updateCourse)
  .delete(authenticate, authorize('admin'), CourseController.deleteCourse);

export const courseRoutes = router;

