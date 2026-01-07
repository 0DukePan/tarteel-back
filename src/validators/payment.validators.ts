import { z } from 'zod';

export const createPaymentSchema = z.object({
  enrollmentId: z.string().uuid('Invalid enrollment ID format'),
  amount: z.number().int().min(0, 'Amount must be a non-negative integer'),
  method: z.string().min(1, 'Payment method is required').max(50, 'Payment method cannot exceed 50 characters'),
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
  transactionId: z.string().max(255, 'Transaction ID cannot exceed 255 characters').optional(),
});

export const updatePaymentSchema = z.object({
  enrollmentId: z.string().uuid('Invalid enrollment ID format').optional(),
  amount: z.number().int().min(0, 'Amount must be a non-negative integer').optional(),
  method: z.string().min(1, 'Payment method is required').max(50, 'Payment method cannot exceed 50 characters').optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
  transactionId: z.string().max(255, 'Transaction ID cannot exceed 255 characters').optional(),
}).partial();

