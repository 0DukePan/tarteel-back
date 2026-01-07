import { z } from 'zod';

export const createCommentSchema = z.object({
  postId: z.string().uuid('Invalid post ID format'),
  authorId: z.string().uuid('Invalid author ID format'),
  authorRole: z.enum(["admin", "teacher", "parent", "student"]), // Ensure valid role
  content: z.string().min(1, 'Content cannot be empty').max(4000, 'Content cannot exceed 4000 characters'),
});

export const updateCommentSchema = z.object({
  postId: z.string().uuid('Invalid post ID format').optional(),
  authorId: z.string().uuid('Invalid author ID format').optional(),
  authorRole: z.enum(["admin", "teacher", "parent", "student"]).optional(),
  content: z.string().min(1, 'Content cannot be empty').max(4000, 'Content cannot exceed 4000 characters').optional(),
}).partial();


