import { Request, Response } from 'express';
import { schedulingService, DayOfWeek } from '../services/schedulingService';
import { logger } from '../config/logger';

export const schedulingController = {
  /**
   * POST /api/scheduling/availability
   * Set teacher availability
   */
  async setAvailability(req: Request, res: Response): Promise<Response> {
    try {
      const { teacherId, dayOfWeek, startTime, endTime, isRecurring, specificDate } = req.body;
      
      if (!teacherId || dayOfWeek === undefined || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: 'teacherId, dayOfWeek, startTime, and endTime are required'
        });
      }

      const slot = await schedulingService.setAvailability({
        teacherId,
        dayOfWeek: parseInt(dayOfWeek) as DayOfWeek,
        startTime,
        endTime,
        isRecurring,
        specificDate: specificDate ? new Date(specificDate) : undefined,
      });

      return res.json({ success: true, data: slot });
    } catch (error: any) {
      logger.error('Error setting availability:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/scheduling/availability/:teacherId
   * Get teacher's availability
   */
  async getTeacherAvailability(req: Request, res: Response): Promise<Response> {
    try {
      const { teacherId } = req.params;
      const slots = await schedulingService.getTeacherAvailability(teacherId);
      return res.json({ success: true, data: slots });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * DELETE /api/scheduling/availability/:teacherId/:slotId
   * Remove availability slot
   */
  async removeAvailability(req: Request, res: Response): Promise<Response> {
    try {
      const { teacherId, slotId } = req.params;
      const removed = await schedulingService.removeAvailability(teacherId, slotId);
      return res.json({ success: true, data: { removed } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/scheduling/slots/:teacherId
   * Get available slots for booking
   */
  async getAvailableSlots(req: Request, res: Response): Promise<Response> {
    try {
      const { teacherId } = req.params;
      const daysAhead = parseInt(req.query.days as string) || 14;
      const slots = await schedulingService.getAvailableSlots(teacherId, daysAhead);
      return res.json({ success: true, data: slots });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/scheduling/book
   * Book a session
   */
  async bookSession(req: Request, res: Response): Promise<Response> {
    try {
      const { teacherId, studentId, scheduledAt, duration, notes } = req.body;
      
      if (!teacherId || !studentId || !scheduledAt) {
        return res.status(400).json({
          success: false,
          message: 'teacherId, studentId, and scheduledAt are required'
        });
      }

      const session = await schedulingService.bookSession({
        teacherId,
        studentId,
        scheduledAt: new Date(scheduledAt),
        duration,
        notes,
      });

      return res.json({ success: true, data: session });
    } catch (error: any) {
      logger.error('Error booking session:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/scheduling/sessions/teacher/:teacherId
   */
  async getTeacherSessions(req: Request, res: Response): Promise<Response> {
    try {
      const { teacherId } = req.params;
      const upcoming = req.query.upcoming !== 'false';
      const sessions = await schedulingService.getTeacherSessions(teacherId, upcoming);
      return res.json({ success: true, data: sessions });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/scheduling/sessions/student/:studentId
   */
  async getStudentSessions(req: Request, res: Response): Promise<Response> {
    try {
      const { studentId } = req.params;
      const upcoming = req.query.upcoming !== 'false';
      const sessions = await schedulingService.getStudentSessions(studentId, upcoming);
      return res.json({ success: true, data: sessions });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * PUT /api/scheduling/sessions/:teacherId/:sessionId/cancel
   */
  async cancelSession(req: Request, res: Response): Promise<Response> {
    try {
      const { teacherId, sessionId } = req.params;
      const session = await schedulingService.cancelSession(sessionId, teacherId);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }
      return res.json({ success: true, data: session });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * PUT /api/scheduling/sessions/:teacherId/:sessionId/complete
   */
  async completeSession(req: Request, res: Response): Promise<Response> {
    try {
      const { teacherId, sessionId } = req.params;
      const { notes } = req.body;
      const session = await schedulingService.completeSession(sessionId, teacherId, notes);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }
      return res.json({ success: true, data: session });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
