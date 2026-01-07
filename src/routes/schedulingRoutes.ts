import { Router } from 'express';
import { schedulingController } from '../controllers/schedulingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Availability management (teacher)
router.post('/availability', authenticate, schedulingController.setAvailability);
router.get('/availability/:teacherId', authenticate, schedulingController.getTeacherAvailability);
router.delete('/availability/:teacherId/:slotId', authenticate, schedulingController.removeAvailability);

// Available slots for booking
router.get('/slots/:teacherId', authenticate, schedulingController.getAvailableSlots);

// Session booking
router.post('/book', authenticate, schedulingController.bookSession);

// Get sessions
router.get('/sessions/teacher/:teacherId', authenticate, schedulingController.getTeacherSessions);
router.get('/sessions/student/:studentId', authenticate, schedulingController.getStudentSessions);

// Session management
router.put('/sessions/:teacherId/:sessionId/cancel', authenticate, schedulingController.cancelSession);
router.put('/sessions/:teacherId/:sessionId/complete', authenticate, schedulingController.completeSession);

export default router;
