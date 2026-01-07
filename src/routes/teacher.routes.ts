import { authenticate, authorize } from '../middleware/auth'
import { createTeacherSchema, updateTeacherSchema } from '../validators/teacher.validators'
import { createTeacher, deleteTeacher, getAllTeachers, getTeacherById, updateTeacher } from '../controllers/teacher.controller'
import express from 'express'
import { validateZod } from '../middleware/zodValidation'

const router = express.Router()


router.get('/', getAllTeachers)
router.get('/:teacherId', getTeacherById)

//protected admin routes
router.use(authenticate)
router.post('/', authorize('admin', 'super_admin'), validateZod(createTeacherSchema), createTeacher)
router.put('/:teacherId', authorize('admin', 'super_admin'), validateZod(updateTeacherSchema), updateTeacher)

router.delete('/:teacherId', authorize('admin', 'super_admin'), deleteTeacher)

export default router