import { z } from 'zod';

export const createCurriculumSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  name: z.string().min(1, "Curriculum name is required").max(255),
  description: z.string().optional(),
});

export const updateCurriculumSchema = z.object({
  courseId: z.string().uuid("Invalid course ID").optional(),
  name: z.string().min(1, "Curriculum name is required").max(255).optional(),
  description: z.string().optional(),
});


