import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateZod as validate } from '../middleware/zodValidation';
import { createAttendanceSchema, updateAttendanceSchema } from '../validators/attendance.validators';

const router = Router();

router.route('/')
  .post(authenticate, authorize('admin', 'teacher'), validate(createAttendanceSchema), AttendanceController.createAttendance)
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), AttendanceController.getAttendanceRecords);

router.route('/:id')
  .get(authenticate, authorize('admin', 'teacher', 'parent', 'student'), AttendanceController.getAttendanceById)
  .put(authenticate, authorize('admin', 'teacher'), validate(updateAttendanceSchema), AttendanceController.updateAttendance)
  .delete(authenticate, authorize('admin'), AttendanceController.deleteAttendance);

export const attendanceRoutes = router;

