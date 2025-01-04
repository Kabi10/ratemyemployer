import * as z from 'zod';
import { INDUSTRIES } from '@/types';

// Review Schema
export const reviewSchema = z.object({
  content: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(2000, 'Review must be less than 2000 characters'),
  rating: z.number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  pros: z.string()
    .max(500, 'Pros must be less than 500 characters')
    .optional(),
  cons: z.string()
    .max(500, 'Cons must be less than 500 characters')
    .optional(),
  position: z.string()
    .min(2, 'Position must be at least 2 characters')
    .max(100, 'Position must be less than 100 characters'),
  employment_status: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'])
});

// Company Schema
export const companySchema = z.object({
  name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  industry: z.enum(INDUSTRIES as unknown as [string, ...string[]]),
  location: z.string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters'),
  website: z.string()
    .url('Please enter a valid URL')
    .optional(),
  size: z.enum(['Small', 'Medium', 'Large', 'Enterprise'])
    .optional(),
  logo_url: z.string()
    .url('Please enter a valid URL')
    .optional()
});

// Export types
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type CompanyFormData = z.infer<typeof companySchema>; 