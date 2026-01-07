import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { BadgeService } from '../services/badge.service';
import { ApiResponse, IBadge, IUserBadge } from '../types';
import { logger } from '../config/logger';

const badgeService = new BadgeService();

export const createBadge = asyncHandler(async (req: Request, res: Response<ApiResponse<IBadge>>, next: NextFunction) => {
  try {
    const badge = await badgeService.createBadge(req.body);
    res.status(201).json({ success: true, message: 'Badge created successfully', data: badge });
  } catch (error) {
    logger.error('Error creating badge:', error);
    next(error);
  }
});

export const getBadges = asyncHandler(async (req: Request, res: Response<ApiResponse<IBadge[]>>, next: NextFunction) => {
  try {
    const badges = await badgeService.getBadges();
    res.status(200).json({ success: true, data: badges });
  } catch (error) {
    logger.error('Error fetching badges:', error);
    next(error);
  }
});

export const getBadgeById = asyncHandler(async (req: Request, res: Response<ApiResponse<IBadge>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const badge = await badgeService.getBadgeById(id);
    res.status(200).json({ success: true, data: badge });
  } catch (error) {
    logger.error(`Error fetching badge with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const updateBadge = asyncHandler(async (req: Request, res: Response<ApiResponse<IBadge>>, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedBadge = await badgeService.updateBadge(id, req.body);
    res.status(200).json({ success: true, message: 'Badge updated successfully', data: updatedBadge });
  } catch (error) {
    logger.error(`Error updating badge with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const deleteBadge = asyncHandler(async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    await badgeService.deleteBadge(id);
    res.status(200).json({ success: true, message: 'Badge deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting badge with ID ${req.params.id}:`, error);
    next(error);
  }
});

export const awardBadgeToStudent = asyncHandler(async (req: Request, res: Response<ApiResponse<IUserBadge>>, next: NextFunction) => {
  try {
    const { studentId, badgeId } = req.body;
    const userBadge = await badgeService.awardBadgeToStudent(studentId, badgeId);
    res.status(201).json({ success: true, message: 'Badge awarded to student successfully', data: userBadge });
  } catch (error) {
    logger.error('Error awarding badge to student:', error);
    next(error);
  }
});

export const getStudentBadges = asyncHandler(async (req: Request, res: Response<ApiResponse<IUserBadge[]>>, next: NextFunction) => {
  try {
    const { studentId } = req.params;
    const studentBadges = await badgeService.getStudentBadges(studentId);
    res.status(200).json({ success: true, data: studentBadges });
  } catch (error) {
    logger.error(`Error fetching badges for student ${req.params.studentId}:`, error);
    next(error);
  }
});

export const revokeBadgeFromStudent = asyncHandler(async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
  try {
    const { id } = req.params;
    await badgeService.revokeBadgeFromStudent(id);
    res.status(200).json({ success: true, message: 'Badge revoked from student successfully' });
  } catch (error) {
    logger.error(`Error revoking badge with ID ${req.params.id}:`, error);
    next(error);
  }
});

