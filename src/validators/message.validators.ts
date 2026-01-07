import { z } from 'zod';

export const createMessageSchema = z.object({
  senderId: z.string().uuid('Invalid sender ID format'),
  receiverId: z.string().uuid('Invalid receiver ID format'),
  senderRole: z.enum(['admin', 'teacher', 'parent', 'student']), 
  receiverRole: z.enum(['admin', 'teacher', 'parent', 'student']), 
  subject: z.string().max(255, 'Subject cannot exceed 255 characters').optional(),
  content: z.string().min(1, 'Message content cannot be empty'),
  read: z.boolean().optional(),
});

export const updateMessageSchema = z.object({
  senderId: z.string().uuid('Invalid sender ID format').optional(),
  receiverId: z.string().uuid('Invalid receiver ID format').optional(),
  senderRole: z.enum(['admin', 'teacher', 'parent', 'student']).optional(), 
  receiverRole: z.enum(['admin', 'teacher', 'parent', 'student']).optional(), 
  subject: z.string().max(255, 'Subject cannot exceed 255 characters').optional(),
  content: z.string().min(1, 'Message content cannot be empty').optional(),
  read: z.boolean().optional(),
}).partial();

