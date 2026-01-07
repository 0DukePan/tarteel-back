import { z } from 'zod';

export const createSubmissionSchema = z.object({
  assignmentId: z.string().uuid('Invalid assignment ID format'),
  studentId: z.string().uuid('Invalid student ID format'),
  submissionUrl: z.string().url('Invalid submission URL format').optional(),
  submissionText: z.string().min(1, 'Submission text cannot be empty').optional(),
  gradeId: z.string().uuid('Invalid grade ID format').optional(),
}).refine(data => data.submissionUrl || data.submissionText, {
  message: 'Either submissionUrl or submissionText must be provided',
  path: ['submissionUrl', 'submissionText'],
});

export const updateSubmissionSchema = z.object({
  assignmentId: z.string().uuid('Invalid assignment ID format').optional(),
  studentId: z.string().uuid('Invalid student ID format').optional(),
  submissionUrl: z.string().url('Invalid submission URL format').optional(),
  submissionText: z.string().min(1, 'Submission text cannot be empty').optional(),
  gradeId: z.string().uuid('Invalid grade ID format').optional(),
}).partial().refine(data => data.submissionUrl || data.submissionText || Object.keys(data).length === 0, {
  message: 'Either submissionUrl or submissionText must be provided if not empty',
  path: ['submissionUrl', 'submissionText'],
});

