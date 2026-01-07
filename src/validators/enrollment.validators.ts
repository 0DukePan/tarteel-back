import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
  courseId: z.string().uuid('Invalid course ID format'),
  status: z.enum(['active', 'completed', 'dropped']).default('active').optional(),
});

export const updateEnrollmentSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format').optional(),
  courseId: z.string().uuid('Invalid course ID format').optional(),
  status: z.enum(['active', 'completed', 'dropped']).optional(),
}).partial();

