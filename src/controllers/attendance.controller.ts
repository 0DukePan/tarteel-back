import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { ApiResponse, PaginatedResponse, IAttendance } from '../types';
import { logger } from '../config/logger';

export const AttendanceController = {
  async createAttendance(req: Request, res: Response<ApiResponse<IAttendance>>, next: NextFunction): Promise<void> {
    try {
      const attendance = await AttendanceService.createAttendance(req.body);
      res.status(201).json({ success: true, message: 'Attendance record created successfully', data: attendance });
    } catch (error) {
      logger.error('Error creating attendance record:', error);
      next(error);
    }
  },

  async getAttendanceRecords(req: Request, res: Response<PaginatedResponse<IAttendance>>, next: NextFunction): Promise<void> {
    try {
      const options = req.query;
      const { attendance, total } = await AttendanceService.getAttendanceRecords(options);
      res.status(200).json({
        success: true,
        data: attendance,
        pagination: {
          page: Number(options.page) || 1,
          limit: Number(options.limit) || 10,
          total,
          pages: Math.ceil(total / (Number(options.limit) || 10)),
        },
      });
    } catch (error) {
      logger.error('Error fetching attendance records:', error);
      next(error);
    }
  },

  async getAttendanceById(req: Request, res: Response<ApiResponse<IAttendance>>, next: NextFunction): Promise<void> {
    try {
      const attendanceRecord = await AttendanceService.getAttendanceById(req.params.id);
      if (!attendanceRecord) {
        res.status(404).json({ success: false, error: 'Attendance record not found' });
        return;
      }
      res.status(200).json({ success: true, data: attendanceRecord });
    } catch (error) {
      logger.error('Error fetching attendance record by ID:', error);
      next(error);
    }
  },

  async updateAttendance(req: Request, res: Response<ApiResponse<IAttendance>>, next: NextFunction): Promise<void> {
    try {
      const attendanceRecord = await AttendanceService.updateAttendance(req.params.id, req.body);
      if (!attendanceRecord) {
        res.status(404).json({ success: false, error: 'Attendance record not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Attendance record updated successfully', data: attendanceRecord });
    } catch (error) {
      logger.error('Error updating attendance record:', error);
      next(error);
    }
  },

  async deleteAttendance(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const success = await AttendanceService.deleteAttendance(req.params.id);
      if (!success) {
        res.status(404).json({ success: false, error: 'Attendance record not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Attendance record deleted successfully' });
    } catch (error) {
      logger.error('Error deleting attendance record:', error);
      next(error);
    }
  },
};

