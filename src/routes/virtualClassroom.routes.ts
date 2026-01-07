import { Router } from 'express';
import { VirtualClassroomController } from '../controllers/virtualClassroom.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const virtualClassroomController = new VirtualClassroomController();

// Virtual Classroom Routes
router.post('/', authenticate, authorize('teacher', 'admin'), virtualClassroomController.createVirtualClassroom);
router.get('/:id', authenticate, authorize('student', 'teacher', 'admin'), virtualClassroomController.getVirtualClassroomById);
router.get('/teacher/:teacherId', authenticate, authorize('teacher', 'admin'), virtualClassroomController.getVirtualClassroomsByTeacherId);
router.get('/class/:classId', authenticate, authorize('student', 'teacher', 'admin'), virtualClassroomController.getVirtualClassroomsByClassId);
router.get('/', authenticate, authorize('student', 'teacher', 'admin'), virtualClassroomController.getAllVirtualClassrooms);
router.put('/:id', authenticate, authorize('teacher', 'admin'), virtualClassroomController.updateVirtualClassroom);
router.delete('/:id', authenticate, authorize('admin'), virtualClassroomController.deleteVirtualClassroom);

// Session Participant Routes
router.post('/participants', authenticate, authorize('student', 'teacher'), virtualClassroomController.addSessionParticipant);
router.get('/participants/:classroomId', authenticate, authorize('student', 'teacher', 'admin'), virtualClassroomController.getSessionParticipantsByClassroomId);
router.put('/participants/:id', authenticate, authorize('student', 'teacher'), virtualClassroomController.updateSessionParticipant);
router.delete('/participants/:id', authenticate, authorize('admin'), virtualClassroomController.removeSessionParticipant);

// Chat Message Routes (for persistent storage of chat)
router.post('/chat', authenticate, authorize('student', 'teacher'), virtualClassroomController.createChatMessage);
router.get('/chat/:classroomId', authenticate, authorize('student', 'teacher', 'admin'), virtualClassroomController.getChatMessagesByClassroomId);
router.delete('/chat/:id', authenticate, authorize('admin'), virtualClassroomController.deleteChatMessage);

export default router;
