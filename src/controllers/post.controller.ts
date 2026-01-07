import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { PostService } from '../services/post.service';
import { ApiResponse, IPost } from '../types';
import { logger } from '../config/logger';

const postService = new PostService();

export const createPost = asyncHandler(async (req: Request, res: Response<ApiResponse<IPost>>, next: NextFunction) => {
  try {
    const post = await postService.createPost(req.body);
    res.status(201).json({ success: true, message: 'Post created successfully', data: post });
  } catch (error) {
    logger.error('Error creating post:', error);
    next(error);
  }
});

export const getPosts = asyncHandler(async (req: Request, res: Response<ApiResponse<IPost[]>>, next: NextFunction) => {
  try {
    const { topicId } = req.query;
    const posts = await postService.getPosts(topicId as string);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    logger.error('Error fetching posts:', error);
    next(error);
  }
});

export const getPostById = asyncHandler(async (req: Request, res: Response<ApiResponse<IPost>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(id);
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    logger.error(`Error fetching post with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const updatePost = asyncHandler(async (req: Request, res: Response<ApiResponse<IPost>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedPost = await postService.updatePost(id, req.body);
    res.status(200).json({ success: true, message: 'Post updated successfully', data: updatedPost });
  } catch (error) {
    logger.error(`Error updating post with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const deletePost = asyncHandler(async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    await postService.deletePost(id);
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting post with ID ${req.params.id}:`, error);
    next(error);
  }
});

