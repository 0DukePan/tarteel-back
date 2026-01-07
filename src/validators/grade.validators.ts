import { z } from 'zod';

export const createGradeSchema = z.object({
  submissionId: z.string().uuid('Invalid submission ID format'),
  assignmentId: z.string().uuid('Invalid assignment ID format'),
  studentId: z.string().uuid('Invalid student ID format'),
  teacherId: z.string().uuid('Invalid teacher ID format').optional(),
  score: z.number().int().min(0, 'Score cannot be negative').max(100, 'Score cannot exceed 100'),
  feedback: z.string().max(1000, 'Feedback cannot exceed 1000 characters').optional(),
});

export const updateGradeSchema = z.object({
  submissionId: z.string().uuid('Invalid submission ID format').optional(),
  assignmentId: z.string().uuid('Invalid assignment ID format').optional(),
  studentId: z.string().uuid('Invalid student ID format').optional(),
  teacherId: z.string().uuid('Invalid teacher ID format').optional(),
  score: z.number().int().min(0, 'Score cannot be negative').max(100, 'Score cannot exceed 100').optional(),
  feedback: z.string().max(1000, 'Feedback cannot exceed 1000 characters').optional(),
}).partial();

