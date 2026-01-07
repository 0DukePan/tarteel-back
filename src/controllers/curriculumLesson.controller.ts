
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { CurriculumLessonService } from '../services/curriculumLesson.service';
import { ApiResponse, ICurriculumLesson } from '../types';
import { logger } from '../config/logger';

const curriculumLessonService = new CurriculumLessonService();

export const createCurriculumLesson = asyncHandler(async (req: Request, res: Response<ApiResponse<ICurriculumLesson>>, next: NextFunction) => {
  try {
    const lesson = await curriculumLessonService.createCurriculumLesson(req.body);
    res.status(201).json({ success: true, message: 'Curriculum lesson created successfully', data: lesson });
  } catch (error) {
    logger.error('Error creating curriculum lesson:', error);
    next(error);
  }
});

export const getCurriculumLessons = asyncHandler(async (req: Request, res: Response<ApiResponse<ICurriculumLesson[]>>, next: NextFunction) => {
  try {
    const { curriculumId } = req.query;
    const result = await curriculumLessonService.getAllCurriculumLessons({ curriculumId: curriculumId as string });
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    logger.error('Error fetching curriculum lessons:', error);
    next(error);
  }
});

export const getCurriculumLessonById = asyncHandler(async (req: Request, res: Response<ApiResponse<ICurriculumLesson>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const lesson = await curriculumLessonService.getCurriculumLessonById(id);
    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    logger.error(`Error fetching curriculum lesson with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const updateCurriculumLesson = asyncHandler(async (req: Request, res: Response<ApiResponse<ICurriculumLesson>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedLesson = await curriculumLessonService.updateCurriculumLesson(id, req.body);
    res.status(200).json({ success: true, message: 'Curriculum lesson updated successfully', data: updatedLesson });
  } catch (error) {
    logger.error(`Error updating curriculum lesson with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const deleteCurriculumLesson = asyncHandler(async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    await curriculumLessonService.deleteCurriculumLesson(id);
    res.status(200).json({ success: true, message: 'Curriculum lesson deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting curriculum lesson with ID ${req.params.id}:`, error);
    next(error);
  }
});


