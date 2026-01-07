import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createCurriculumLesson, deleteCurriculumLesson, getCurriculumLessonById, getCurriculumLessons, updateCurriculumLesson } from '../controllers/curriculumLesson.controller';
import { createCurriculumLessonSchema, updateCurriculumLessonSchema } from '../validators/curriculumLesson.validators';

const router = express.Router();

router.route('/')
  .post(authenticate, authorize('admin', 'teacher'), validate(createCurriculumLessonSchema), createCurriculumLesson)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), getCurriculumLessons);

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), getCurriculumLessonById)
  .put(authenticate, authorize('admin', 'teacher'), validate(updateCurriculumLessonSchema), updateCurriculumLesson)
  .delete(authenticate, authorize('admin', 'teacher'), deleteCurriculumLesson);

export default router;


