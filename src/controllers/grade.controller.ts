import { Request, Response, NextFunction } from 'express';
import { GradeService } from '../services/grade.service';
import { ApiResponse, PaginatedResponse, IGrade } from '../types';
import { logger } from '../config/logger';

export const GradeController = {
  async createGrade(req: Request, res: Response<ApiResponse<IGrade>>, next: NextFunction): Promise<void> {
    try {
      const grade = await GradeService.createGrade(req.body);
      res.status(201).json({ success: true, message: 'Grade created successfully', data: grade });
    } catch (error) {
      logger.error('Error creating grade:', error);
      next(error);
    }
  },

  async getGrades(req: Request, res: Response<PaginatedResponse<IGrade>>, next: NextFunction): Promise<void> {
    try {
      const options = req.query;
      const { grades, total } = await GradeService.getGrades(options);
      res.status(200).json({
        success: true,
        data: grades,
        pagination: {
          page: Number(options.page) || 1,
          limit: Number(options.limit) || 10,
          total,
          pages: Math.ceil(total / (Number(options.limit) || 10)),
        },
      });
    } catch (error) {
      logger.error('Error fetching grades:', error);
      next(error);
    }
  },

  async getGradeById(req: Request, res: Response<ApiResponse<IGrade>>, next: NextFunction): Promise<void> {
    try {
      const grade = await GradeService.getGradeById(req.params.id);
      if (!grade) {
        res.status(404).json({ success: false, error: 'Grade not found' });
        return;
      }
      res.status(200).json({ success: true, data: grade });
    } catch (error) {
      logger.error('Error fetching grade by ID:', error);
      next(error);
    }
  },

  async updateGrade(req: Request, res: Response<ApiResponse<IGrade>>, next: NextFunction): Promise<void> {
    try {
      const grade = await GradeService.updateGrade(req.params.id, req.body);
      if (!grade) {
        res.status(404).json({ success: false, error: 'Grade not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Grade updated successfully', data: grade });
    } catch (error) {
      logger.error('Error updating grade:', error);
      next(error);
    }
  },

  async deleteGrade(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const success = await GradeService.deleteGrade(req.params.id);
      if (!success) {
        res.status(404).json({ success: false, error: 'Grade not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Grade deleted successfully' });
    } catch (error) {
      logger.error('Error deleting grade:', error);
      next(error);
    }
  },
};

