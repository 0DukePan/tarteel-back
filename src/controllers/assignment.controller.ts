import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from '../services/assignment.service';
import { ApiResponse, PaginatedResponse, IAssignment } from '../types';
import { logger } from '../config/logger';

export const AssignmentController = {
  async createAssignment(req: Request, res: Response<ApiResponse<IAssignment>>, next: NextFunction): Promise<void> {
    try {
      const assignment = await AssignmentService.createAssignment(req.body);
      res.status(201).json({ success: true, message: 'Assignment created successfully', data: assignment });
    } catch (error) {
      logger.error('Error creating assignment:', error);
      next(error);
    }
  },

  async getAssignments(req: Request, res: Response<PaginatedResponse<IAssignment>>, next: NextFunction): Promise<void> {
    try {
      const options = req.query;
      const { assignments, total } = await AssignmentService.getAssignments(options);
      res.status(200).json({
        success: true,
        data: assignments,
        pagination: {
          page: Number(options.page) || 1,
          limit: Number(options.limit) || 10,
          total,
          pages: Math.ceil(total / (Number(options.limit) || 10)),
        },
      });
    } catch (error) {
      logger.error('Error fetching assignments:', error);
      next(error);
    }
  },

  async getAssignmentById(req: Request, res: Response<ApiResponse<IAssignment>>, next: NextFunction): Promise<void> {
    try {
      const assignment = await AssignmentService.getAssignmentById(req.params.id);
      if (!assignment) {
        res.status(404).json({ success: false, error: 'Assignment not found' });
        return;
      }
      res.status(200).json({ success: true, data: assignment });
    } catch (error) {
      logger.error('Error fetching assignment by ID:', error);
      next(error);
    }
  },

  async updateAssignment(req: Request, res: Response<ApiResponse<IAssignment>>, next: NextFunction): Promise<void> {
    try {
      const assignment = await AssignmentService.updateAssignment(req.params.id, req.body);
      if (!assignment) {
        res.status(404).json({ success: false, error: 'Assignment not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Assignment updated successfully', data: assignment });
    } catch (error) {
      logger.error('Error updating assignment:', error);
      next(error);
    }
  },

  async deleteAssignment(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const success = await AssignmentService.deleteAssignment(req.params.id);
      if (!success) {
        res.status(404).json({ success: false, error: 'Assignment not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
    } catch (error) {
      logger.error('Error deleting assignment:', error);
      next(error);
    }
  },
};

