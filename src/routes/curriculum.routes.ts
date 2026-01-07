import { authenticate, authorize } from '../middleware/auth';
import { createCurriculum, deleteCurriculum, getAllCurriculums, getCurriculumById, updateCurriculum } from '../controllers/curriculum.controller';
import express from 'express';
import { validateZod as validate } from '../middleware/zodValidation';
import { createCurriculumSchema, updateCurriculumSchema } from '../validators/curriculum.validators';

const router = express.Router();

// Public route to get all curriculums (students/parents might need to view)
router.get('/', getAllCurriculums);
router.get('/:id', getCurriculumById);

// Protected routes (admin/teacher)
router.use(authenticate);
router.post('/', authorize('admin', 'teacher'), validate(createCurriculumSchema), createCurriculum);
router.put('/:id', authorize('admin', 'teacher'), validate(updateCurriculumSchema), updateCurriculum);
router.delete('/:id', authorize('admin', 'teacher'), deleteCurriculum);

export default router;


