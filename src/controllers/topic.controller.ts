import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { TopicService } from '../services/topic.service';
import { ApiResponse, ITopic } from '../types';
import { logger } from '../config/logger';

const topicService = new TopicService();

export const createTopic = asyncHandler(async (req: Request, res: Response<ApiResponse<ITopic>>, next: NextFunction) => {
  try {
    const topic = await topicService.createTopic(req.body);
    res.status(201).json({ success: true, message: 'Topic created successfully', data: topic });
  } catch (error) {
    logger.error('Error creating topic:', error);
    next(error);
  }
});

export const getTopics = asyncHandler(async (req: Request, res: Response<ApiResponse<ITopic[]>>, next: NextFunction) => {
  try {
    const { forumId } = req.query;
    const topics = await topicService.getTopics(forumId as string);
    res.status(200).json({ success: true, data: topics });
  } catch (error) {
    logger.error('Error fetching topics:', error);
    next(error);
  }
});

export const getTopicById = asyncHandler(async (req: Request, res: Response<ApiResponse<ITopic>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const topic = await topicService.getTopicById(id);
    res.status(200).json({ success: true, data: topic });
  } catch (error) {
    logger.error(`Error fetching topic with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const updateTopic = asyncHandler(async (req: Request, res: Response<ApiResponse<ITopic>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedTopic = await topicService.updateTopic(id, req.body);
    res.status(200).json({ success: true, message: 'Topic updated successfully', data: updatedTopic });
  } catch (error) {
    logger.error(`Error updating topic with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const deleteTopic = asyncHandler(async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    await topicService.deleteTopic(id);
    res.status(200).json({ success: true, message: 'Topic deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting topic with ID ${req.params.id}:`, error);
    next(error);
  }
});


