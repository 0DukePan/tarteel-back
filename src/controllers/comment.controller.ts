import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { CommentService } from '../services/comment.service';
import { ApiResponse, IComment } from '../types';
import { logger } from '../config/logger';

const commentService = new CommentService();

export const createComment = asyncHandler(async (req: Request, res: Response<ApiResponse<IComment>>, next: NextFunction) => {
  try {
    const comment = await commentService.createComment(req.body);
    res.status(201).json({ success: true, message: 'Comment created successfully', data: comment });
  } catch (error) {
    logger.error('Error creating comment:', error);
    next(error);
  }
});

export const getComments = asyncHandler(async (req: Request, res: Response<ApiResponse<IComment[]>>, next: NextFunction) => {
  try {
    const { postId } = req.query;
    const comments = await commentService.getComments(postId as string);
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    logger.error('Error fetching comments:', error);
    next(error);
  }
});

export const getCommentById = asyncHandler(async (req: Request, res: Response<ApiResponse<IComment>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const comment = await commentService.getCommentById(id);
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    logger.error(`Error fetching comment with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const updateComment = asyncHandler(async (req: Request, res: Response<ApiResponse<IComment>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedComment = await commentService.updateComment(id, req.body);
    res.status(200).json({ success: true, message: 'Comment updated successfully', data: updatedComment });
  } catch (error) {
    logger.error(`Error updating comment with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const deleteComment = asyncHandler(async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    await commentService.deleteComment(id);
    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting comment with ID ${req.params.id}:`, error);
    next(error);
  }
});


