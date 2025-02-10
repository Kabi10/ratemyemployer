import * as z from 'zod';
import type { Database } from '@/types/supabase';

type Review = Database['public']['Tables']['reviews']['Row'];

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(255),
  content: z.string().min(10),
  pros: z.string().min(3).optional(),
  cons: z.string().min(3).optional(),
  position: z.string().min(2).max(255),
  employment_status: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']),
  is_current_employee: z.boolean(),
  company_id: z.number(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
