import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(1, 'Review content is required'),
  position: z.string().min(1, 'Position is required'),
  employment_status: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
});

export type ReviewFormData = z.infer<typeof reviewSchema>; 