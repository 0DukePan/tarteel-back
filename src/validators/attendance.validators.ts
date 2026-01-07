import { z } from 'zod';

export const createAttendanceSchema = z.object({
  classId: z.string().uuid('Invalid class ID format'),
  studentId: z.string().uuid('Invalid student ID format'),
  date: z.string().datetime('Invalid date format'),
  status: z.enum(['present', 'absent', 'excused']).default('present'),
});

export const updateAttendanceSchema = z.object({
  classId: z.string().uuid('Invalid class ID format').optional(),
  studentId: z.string().uuid('Invalid student ID format').optional(),
  date: z.string().datetime('Invalid date format').optional(),
  status: z.enum(['present', 'absent', 'excused']).optional(),
}).partial();

