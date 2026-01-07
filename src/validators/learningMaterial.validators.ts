import { z } from 'zod';

export const createLearningMaterialSchema = z.object({
  classId: z.string().uuid("Invalid class ID"),
  teacherId: z.string().uuid("Invalid teacher ID").optional().nullable(),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  fileUrl: z.string().url("Invalid URL for file"),
  fileType: z.string().min(1, "File type is required").max(50),
});

export const updateLearningMaterialSchema = z.object({
  classId: z.string().uuid("Invalid class ID").optional(),
  teacherId: z.string().uuid("Invalid teacher ID").optional().nullable(),
  title: z.string().min(1, "Title is required").max(255).optional(),
  description: z.string().optional(),
  fileUrl: z.string().url("Invalid URL for file").optional(),
  fileType: z.string().min(1, "File type is required").max(50).optional(),
});


