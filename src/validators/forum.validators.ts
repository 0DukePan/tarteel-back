import { z } from 'zod';

export const createForumSchema = z.object({
  name: z.string().min(3, 'Forum name must be at least 3 characters long').max(255, 'Forum name cannot exceed 255 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
});

export const updateForumSchema = z.object({
  name: z.string().min(3, 'Forum name must be at least 3 characters long').max(255, 'Forum name cannot exceed 255 characters').optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
}).partial();


