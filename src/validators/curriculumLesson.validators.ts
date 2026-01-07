import { z } from 'zod';

export const createCurriculumLessonSchema = z.object({
  curriculumId: z.string().uuid('Invalid curriculum ID format'),
  title: z.string().min(3, 'Title must be at least 3 characters long').max(255, 'Title cannot exceed 255 characters'),
  content: z.string().max(4000, 'Content cannot exceed 4000 characters').optional(),
  orderIndex: z.number().int().min(0, 'Order index must be a non-negative integer'),
  materialUrl: z.string().url('Invalid material URL format').optional().or(z.literal('')), // Allow empty string for optional
  videoUrl: z.string().url('Invalid video URL format').optional().or(z.literal('')), // Allow empty string for optional
  quizUrl: z.string().url('Invalid quiz URL format').optional().or(z.literal('')) // Allow empty string for optional
});

export const updateCurriculumLessonSchema = z.object({
  curriculumId: z.string().uuid('Invalid curriculum ID format').optional(),
  title: z.string().min(3, 'Title must be at least 3 characters long').max(255, 'Title cannot exceed 255 characters').optional(),
  content: z.string().max(4000, 'Content cannot exceed 4000 characters').optional(),
  orderIndex: z.number().int().min(0, 'Order index must be a non-negative integer').optional(),
  materialUrl: z.string().url('Invalid material URL format').optional().or(z.literal('')), // Allow empty string for optional
  videoUrl: z.string().url('Invalid video URL format').optional().or(z.literal('')), // Allow empty string for optional
  quizUrl: z.string().url('Invalid quiz URL format').optional().or(z.literal('')) // Allow empty string for optional
}).partial();


