import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required").max(200),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid end time format (HH:MM)"),
  classType: z.enum(["one-on-one", "group", "self-paced"]).default("group"),
  recurrence: z.string().optional(),
  virtualMeetingLink: z.string().url("Invalid URL for virtual meeting link").optional(),
  ageMin: z.number().int().min(1, "Minimum age must be at least 1").max(99),
  ageMax: z.number().int().min(1, "Maximum age must be at least 1").max(99),
  teacherId: z.string().uuid("Invalid teacher ID").optional(),
  maxStudents: z.number().int().min(1, "Max students must be at least 1").default(20),
});

export const updateClassSchema = z.object({
  name: z.string().min(1, "Class name is required").max(200).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time format (HH:MM)").optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid end time format (HH:MM)").optional(),
  classType: z.enum(["one-on-one", "group", "self-paced"]).optional(),
  recurrence: z.string().optional(),
  virtualMeetingLink: z.string().url("Invalid URL for virtual meeting link").optional(),
  ageMin: z.number().int().min(1, "Minimum age must be at least 1").max(99).optional(),
  ageMax: z.number().int().min(1, "Maximum age must be at least 1").max(99).optional(),
  teacherId: z.string().uuid("Invalid teacher ID").optional().nullable(), // Allow null to unassign teacher
  maxStudents: z.number().int().min(1, "Max students must be at least 1").optional(),
});


