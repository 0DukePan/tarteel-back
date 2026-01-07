import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';
import { ApiResponse, PaginatedResponse, ICourse } from '../types';
import { logger } from '../config/logger';

export const CourseController = {
  async createCourse(req: Request, res: Response<ApiResponse<ICourse>>, next: NextFunction): Promise<void> {
    try {
      const course = await CourseService.createCourse(req.body);
      res.status(201).json({ success: true, message: 'Course created successfully', data: course });
    } catch (error) {
      logger.error('Error creating course:', error);
      next(error);
    }
  },

  async getCourses(req: Request, res: Response<PaginatedResponse<ICourse>>, next: NextFunction): Promise<void> {
    try {
      const options = req.query;
      const { courses, total } = await CourseService.getCourses(options);
      res.status(200).json({
        success: true,
        data: courses,
        pagination: {
          page: Number(options.page) || 1,
          limit: Number(options.limit) || 10,
          total,
          pages: Math.ceil(total / (Number(options.limit) || 10)),
        },
      });
    } catch (error) {
      logger.error('Error fetching courses:', error);
      next(error);
    }
  },

  async getCourseById(req: Request, res: Response<ApiResponse<ICourse>>, next: NextFunction): Promise<void> {
    try {
      const course = await CourseService.getCourseById(req.params.id);
      if (!course) {
        res.status(404).json({ success: false, error: 'Course not found' });
        return;
      }
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      logger.error('Error fetching course by ID:', error);
      next(error);
    }
  },

  async updateCourse(req: Request, res: Response<ApiResponse<ICourse>>, next: NextFunction): Promise<void> {
    try {
      const course = await CourseService.updateCourse(req.params.id, req.body);
      if (!course) {
        res.status(404).json({ success: false, error: 'Course not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Course updated successfully', data: course });
    } catch (error) {
      logger.error('Error updating course:', error);
      next(error);
    }
  },

  async deleteCourse(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const success = await CourseService.deleteCourse(req.params.id);
      if (!success) {
        res.status(404).json({ success: false, error: 'Course not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
      logger.error('Error deleting course:', error);
      next(error);
    }
  },
};

