import { z } from 'zod';

export const createTeacherSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(1, "Phone number is required").max(20),
  specialization: z.string().optional(),
  biography: z.string().optional(),
  profilePicture: z.string().url("Invalid URL for profile picture").optional(),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
  role: z.string().optional(),
});

export const updateTeacherSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).optional(),
  email: z.string().email("Invalid email address").max(255).optional(),
  phone: z.string().min(1, "Phone number is required").max(20).optional(),
  specialization: z.string().optional(),
  biography: z.string().optional(),
  profilePicture: z.string().url("Invalid URL for profile picture").optional(),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
  role: z.string().optional(),
});


