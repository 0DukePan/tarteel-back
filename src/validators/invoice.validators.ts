import { z } from 'zod';

export const createInvoiceSchema = z.object({
  enrollmentId: z.string().uuid('Invalid enrollment ID format').optional(),
  parentId: z.string().uuid('Invalid parent ID format'),
  amountDue: z.number().int().min(0, 'Amount due must be a non-negative integer'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'),
  status: z.enum(["unpaid", "paid", "partially_paid", "overdue"]).default("unpaid"),
  fileUrl: z.string().url('Invalid file URL format').optional(),
});

export const updateInvoiceSchema = z.object({
  enrollmentId: z.string().uuid('Invalid enrollment ID format').optional(),
  parentId: z.string().uuid('Invalid parent ID format').optional(),
  amountDue: z.number().int().min(0, 'Amount due must be a non-negative integer').optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format').optional(),
  status: z.enum(["unpaid", "paid", "partially_paid", "overdue"]).optional(),
  fileUrl: z.string().url('Invalid file URL format').optional(),
}).partial();

