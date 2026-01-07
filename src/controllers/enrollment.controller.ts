import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from '../services/enrollment.service';
import { ApiResponse, PaginatedResponse, IEnrollment } from '../types';
import { logger } from '../config/logger';

export const EnrollmentController = {
  async createEnrollment(req: Request, res: Response<ApiResponse<IEnrollment>>, next: NextFunction): Promise<void> {
    try {
      const enrollment = await EnrollmentService.createEnrollment(req.body);
      res.status(201).json({ success: true, message: 'Enrollment created successfully', data: enrollment });
    } catch (error) {
      logger.error('Error creating enrollment:', error);
      next(error);
    }
  },

  async getEnrollments(req: Request, res: Response<PaginatedResponse<IEnrollment>>, next: NextFunction): Promise<void> {
    try {
      const options = req.query;
      const { enrollments, total } = await EnrollmentService.getEnrollments(options);
      res.status(200).json({
        success: true,
        data: enrollments,
        pagination: {
          page: Number(options.page) || 1,
          limit: Number(options.limit) || 10,
          total,
          pages: Math.ceil(total / (Number(options.limit) || 10)),
        },
      });
    } catch (error) {
      logger.error('Error fetching enrollments:', error);
      next(error);
    }
  },

  async getEnrollmentById(req: Request, res: Response<ApiResponse<IEnrollment>>, next: NextFunction): Promise<void> {
    try {
      const enrollment = await EnrollmentService.getEnrollmentById(req.params.id);
      if (!enrollment) {
        res.status(404).json({ success: false, error: 'Enrollment not found' });
        return;
      }
      res.status(200).json({ success: true, data: enrollment });
    } catch (error) {
      logger.error('Error fetching enrollment by ID:', error);
      next(error);
    }
  },

  async updateEnrollment(req: Request, res: Response<ApiResponse<IEnrollment>>, next: NextFunction): Promise<void> {
    try {
      const enrollment = await EnrollmentService.updateEnrollment(req.params.id, req.body);
      if (!enrollment) {
        res.status(404).json({ success: false, error: 'Enrollment not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Enrollment updated successfully', data: enrollment });
    } catch (error) {
      logger.error('Error updating enrollment:', error);
      next(error);
    }
  },

  async deleteEnrollment(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const success = await EnrollmentService.deleteEnrollment(req.params.id);
      if (!success) {
        res.status(404).json({ success: false, error: 'Enrollment not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Enrollment deleted successfully' });
    } catch (error) {
      logger.error('Error deleting enrollment:', error);
      next(error);
    }
  },
};

