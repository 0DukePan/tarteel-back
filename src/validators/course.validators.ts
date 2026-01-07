import { z } from 'zod';

export const createCourseSchema = z.object({
  name: z.string().min(3, 'Course name must be at least 3 characters long').max(200, 'Course name cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  teacherId: z.string().uuid('Invalid teacher ID format').optional(),
});

export const updateCourseSchema = z.object({
  name: z.string().min(3, 'Course name must be at least 3 characters long').max(200, 'Course name cannot exceed 200 characters').optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  teacherId: z.string().uuid('Invalid teacher ID format').optional(),
}).partial();


