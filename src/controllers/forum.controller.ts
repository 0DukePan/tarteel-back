import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ForumService } from '../services/forum.service';
import { ApiResponse, IForum } from '../types';
import { logger } from '../config/logger';

const forumService = new ForumService();

export const createForum = asyncHandler(async (req: Request, res: Response<ApiResponse<IForum>>, next: NextFunction) => {
  try {
    const forum = await forumService.createForum(req.body);
    res.status(201).json({ success: true, message: 'Forum created successfully', data: forum });
  } catch (error) {
    logger.error('Error creating forum:', error);
    next(error);
  }
});

export const getAllForums = asyncHandler(async (req: Request, res: Response<ApiResponse<IForum[]>>, next: NextFunction) => {
  try {
    const forums = await forumService.getAllForums();
    res.status(200).json({ success: true, data: forums });
  } catch (error) {
    logger.error('Error fetching all forums:', error);
    next(error);
  }
});

export const getForumById = asyncHandler(async (req: Request, res: Response<ApiResponse<IForum>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const forum = await forumService.getForumById(id);
    res.status(200).json({ success: true, data: forum });
  } catch (error) {
    logger.error(`Error fetching forum with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const updateForum = asyncHandler(async (req: Request, res: Response<ApiResponse<IForum>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedForum = await forumService.updateForum(id, req.body);
    res.status(200).json({ success: true, message: 'Forum updated successfully', data: updatedForum });
  } catch (error) {
    logger.error(`Error updating forum with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const deleteForum = asyncHandler(async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    await forumService.deleteForum(id);
    res.status(200).json({ success: true, message: 'Forum deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting forum with ID ${req.params.id}:`, error);
    next(error);
  }
});


