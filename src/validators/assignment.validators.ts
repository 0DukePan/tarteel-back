import { z } from 'zod';

export const createAssignmentSchema = z.object({
  courseId: z.string().uuid('Invalid course ID format'),
  teacherId: z.string().uuid('Invalid teacher ID format').optional(),
  title: z.string().min(3, 'Assignment title must be at least 3 characters long').max(255, 'Assignment title cannot exceed 255 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  dueDate: z.string().datetime('Invalid due date format'),
  maxPoints: z.number().int().positive('Max points must be a positive integer').optional(),
});

export const updateAssignmentSchema = z.object({
  courseId: z.string().uuid('Invalid course ID format').optional(),
  teacherId: z.string().uuid('Invalid teacher ID format').optional(),
  title: z.string().min(3, 'Assignment title must be at least 3 characters long').max(255, 'Assignment title cannot exceed 255 characters').optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  dueDate: z.string().datetime('Invalid due date format').optional(),
  maxPoints: z.number().int().positive('Max points must be a positive integer').optional(),
}).partial();

