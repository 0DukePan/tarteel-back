import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const notificationController = new NotificationController();

// Notification Routes
router.post('/', authenticate, authorize('student', 'admin', 'teacher'), notificationController.createNotification);
router.get('/:id', authenticate, authorize('student', 'admin', 'teacher'), notificationController.getNotificationById);
router.get('/student/:studentId', authenticate, authorize('student', 'admin', 'teacher'), notificationController.getNotificationsByStudentId);
router.put('/:id', authenticate, authorize('student', 'admin', 'teacher'), notificationController.updateNotification);
router.delete('/:id', authenticate, authorize('admin'), notificationController.deleteNotification);

// Trigger reminders
router.post('/trigger-hifz-reminders', authenticate, authorize('admin'), notificationController.triggerHifzReminders);

export default router;
