import { Request, Response, NextFunction } from 'express';
import { SubmissionService } from '../services/submission.service';
import { ApiResponse, PaginatedResponse, ISubmission } from '../types';
import { logger } from '../config/logger';

export const SubmissionController = {
  async createSubmission(req: Request, res: Response<ApiResponse<ISubmission>>, next: NextFunction): Promise<void> {
    try {
      const submission = await SubmissionService.createSubmission(req.body);
      res.status(201).json({ success: true, message: 'Submission created successfully', data: submission });
    } catch (error) {
      logger.error('Error creating submission:', error);
      next(error);
    }
  },

  async getSubmissions(req: Request, res: Response<PaginatedResponse<ISubmission>>, next: NextFunction): Promise<void> {
    try {
      const options = req.query;
      const { submissions, total } = await SubmissionService.getSubmissions(options);
      res.status(200).json({
        success: true,
        data: submissions,
        pagination: {
          page: Number(options.page) || 1,
          limit: Number(options.limit) || 10,
          total,
          pages: Math.ceil(total / (Number(options.limit) || 10)),
        },
      });
    } catch (error) {
      logger.error('Error fetching submissions:', error);
      next(error);
    }
  },

  async getSubmissionById(req: Request, res: Response<ApiResponse<ISubmission>>, next: NextFunction): Promise<void> {
    try {
      const submission = await SubmissionService.getSubmissionById(req.params.id);
      if (!submission) {
        res.status(404).json({ success: false, error: 'Submission not found' });
        return;
      }
      res.status(200).json({ success: true, data: submission });
    } catch (error) {
      logger.error('Error fetching submission by ID:', error);
      next(error);
    }
  },

  async updateSubmission(req: Request, res: Response<ApiResponse<ISubmission>>, next: NextFunction): Promise<void> {
    try {
      const submission = await SubmissionService.updateSubmission(req.params.id, req.body);
      if (!submission) {
        res.status(404).json({ success: false, error: 'Submission not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Submission updated successfully', data: submission });
    } catch (error) {
      logger.error('Error updating submission:', error);
      next(error);
    }
  },

  async deleteSubmission(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const success = await SubmissionService.deleteSubmission(req.params.id);
      if (!success) {
        res.status(404).json({ success: false, error: 'Submission not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Submission deleted successfully' });
    } catch (error) {
      logger.error('Error deleting submission:', error);
      next(error);
    }
  },
};

