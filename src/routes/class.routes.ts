import { authenticate, authorize } from '../middleware/auth'
import { createClassSchema, updateClassSchema } from '../validators/class.validators'
import { createClass, deleteClass, getAvailableClasses, getClassById, updateClass } from '../controllers/class.controller'
import express from 'express'
import { validateZod } from '../middleware/zodValidation'

const router = express.Router()


router.get('/', getAvailableClasses)
router.get('/:classId', getClassById)

router.use(authenticate)
router.post('/', authorize('admin', 'super_admin'), validateZod(createClassSchema), createClass)
router.put('/:classId', authorize('admin', 'super_admin'), validateZod(updateClassSchema), updateClass)
router.delete('/:classId', authorize('admin', 'super_admin'), deleteClass)

export default router