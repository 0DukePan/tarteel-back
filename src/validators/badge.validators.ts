import { z } from 'zod';

export const createBadgeSchema = z.object({
  name: z.string().min(3, 'Badge name is required').max(255, 'Badge name cannot exceed 255 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  iconUrl: z.string().url('Invalid icon URL format').optional(),
  criteria: z.string().max(1000, 'Criteria cannot exceed 1000 characters').optional(),
});

export const updateBadgeSchema = z.object({
  name: z.string().min(3, 'Badge name is required').max(255, 'Badge name cannot exceed 255 characters').optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  iconUrl: z.string().url('Invalid icon URL format').optional(),
  criteria: z.string().max(1000, 'Criteria cannot exceed 1000 characters').optional(),
}).partial();

export const awardBadgeSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
  badgeId: z.string().uuid('Invalid badge ID format'),
});

