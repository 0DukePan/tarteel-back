import { authenticate, authorize } from '../middleware/auth';
import { createLearningMaterial, deleteLearningMaterial, getAllLearningMaterials, getLearningMaterialById, updateLearningMaterial } from '../controllers/learningMaterial.controller';
import express from 'express';
import { validateZod as validate } from '../middleware/zodValidation';
import { createLearningMaterialSchema, updateLearningMaterialSchema } from '../validators/learningMaterial.validators';

const router = express.Router();

// Public route to get all learning materials (students/parents might need to view)
router.get('/', getAllLearningMaterials);
router.get('/:id', getLearningMaterialById);

// Protected routes (admin/teacher)
router.use(authenticate);
router.post('/', authorize('admin', 'teacher'), validate(createLearningMaterialSchema), createLearningMaterial);
router.put('/:id', authorize('admin', 'teacher'), validate(updateLearningMaterialSchema), updateLearningMaterial);
router.delete('/:id', authorize('admin', 'teacher'), deleteLearningMaterial);

export default router;


