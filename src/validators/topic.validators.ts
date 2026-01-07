import { z } from 'zod';

export const createTopicSchema = z.object({
  forumId: z.string().uuid('Invalid forum ID format'),
  authorId: z.string().uuid('Invalid author ID format'),
  authorRole: z.enum(["admin", "teacher", "parent", "student"]), // Ensure valid role
  title: z.string().min(3, 'Title must be at least 3 characters long').max(255, 'Title cannot exceed 255 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters long').max(4000, 'Content cannot exceed 4000 characters'),
});

export const updateTopicSchema = z.object({
  forumId: z.string().uuid('Invalid forum ID format').optional(),
  authorId: z.string().uuid('Invalid author ID format').optional(),
  authorRole: z.enum(["admin", "teacher", "parent", "student"]).optional(),
  title: z.string().min(3, 'Title must be at least 3 characters long').max(255, 'Title cannot exceed 255 characters').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters long').max(4000, 'Content cannot exceed 4000 characters').optional(),
}).partial();


