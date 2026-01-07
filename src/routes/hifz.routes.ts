import { Router } from 'express';
import { HifzController } from '../controllers/hifz.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const hifzController = new HifzController();

// Hifz Progress Routes
router.post('/progress', authenticate, authorize('student'), hifzController.createHifzProgress);
router.get('/progress/:id', authenticate, authorize('student', 'admin', 'teacher'), hifzController.getHifzProgressById);
router.get('/progress/student/:studentId', authenticate, authorize('student', 'admin', 'teacher'), hifzController.getHifzProgressByStudentId);
router.put('/progress/:id', authenticate, authorize('student', 'admin', 'teacher'), hifzController.updateHifzProgress);
router.delete('/progress/:id', authenticate, authorize('student', 'admin'), hifzController.deleteHifzProgress);

// Hifz Goals Routes
router.post('/goals', authenticate, authorize('student'), hifzController.createHifzGoal);
router.get('/goals/:id', authenticate, authorize('student', 'admin', 'teacher'), hifzController.getHifzGoalById);
router.get('/goals/student/:studentId', authenticate, authorize('student', 'admin', 'teacher'), hifzController.getHifzGoalsByStudentId);
router.put('/goals/:id', authenticate, authorize('student', 'admin', 'teacher'), hifzController.updateHifzGoal);
router.delete('/goals/:id', authenticate, authorize('student', 'admin'), hifzController.deleteHifzGoal);

// Revision Schedules Routes
router.post('/schedules', authenticate, authorize('student'), hifzController.createRevisionSchedule);
router.get('/schedules/:id', authenticate, authorize('student', 'admin', 'teacher'), hifzController.getRevisionScheduleById);
router.get('/schedules/student/:studentId', authenticate, authorize('student', 'admin', 'teacher'), hifzController.getRevisionSchedulesByStudentId);
router.put('/schedules/:id', authenticate, authorize('student', 'admin', 'teacher'), hifzController.updateRevisionSchedule);
router.delete('/schedules/:id', authenticate, authorize('student', 'admin'), hifzController.deleteRevisionSchedule);

export default router;
