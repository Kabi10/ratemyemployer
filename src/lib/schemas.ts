import { INDUSTRIES } from '@/types';
import * as z from 'zod';
import type { Database } from '@/types/supabase';

type Company = Database['public']['Tables']['companies']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

// Enums
export const employmentStatusEnum = ['Full-time', 'Part-time', 'Contract', 'Intern'] as const;
export const verificationStatusEnum = ['pending', 'verified', 'rejected'] as const;
export const reviewStatusEnum = ['pending', 'approved', 'rejected'] as const;
export const rateLimitTypeEnum = ['review', 'company', 'report'] as const;

// Validation Messages
export const ERROR_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid website URL',
  min: (field: string, length: number) => `${field} must be at least ${length} characters`,
  max: (field: string, length: number) => `${field} must be less than ${length} characters`,
  rating: 'Rating must be between 1 and 5 stars',
  invalidEnum: (field: string, options: readonly string[]) => 
    `${field} must be one of: ${options.join(', ')}`,
  name: 'Company name must be at least 2 characters',
  website: 'Please enter a valid URL',
  industry: 'Please select an industry',
  location: 'Location must be at least 2 characters',
  title: 'Title must be between 3 and 255 characters',
  content: 'Review must be at least 10 characters',
  position: 'Position must be between 2 and 255 characters'
};

// Review Schema
export const reviewSchema = z.object({
  rating: z.number()
    .min(1, ERROR_MESSAGES.rating)
    .max(5, ERROR_MESSAGES.rating),
  title: z.string().min(3, ERROR_MESSAGES.title).max(255),
  content: z.string().min(10, ERROR_MESSAGES.content),
  pros: z.string().min(3).optional(),
  cons: z.string().min(3).optional(),
  position: z.string().min(2, ERROR_MESSAGES.position).max(255),
  employment_status: z.enum(employmentStatusEnum, {
    errorMap: () => ({ message: ERROR_MESSAGES.invalidEnum('Employment status', employmentStatusEnum) })
  }),
  is_current_employee: z.boolean(),
  company_id: z.number()
});

// Company Schema
export const companySchema = z.object({
  name: z.string().min(2, ERROR_MESSAGES.name),
  website: z.string().url(ERROR_MESSAGES.website).optional().or(z.literal('')),
  industry: z.string().min(2, ERROR_MESSAGES.industry),
  location: z.string().min(2, ERROR_MESSAGES.location),
  description: z.string().optional(),
  ceo: z.string().optional(),
  size: z.enum(['Small', 'Medium', 'Large', 'Enterprise'], {
    errorMap: () => ({ message: ERROR_MESSAGES.invalidEnum('Company size', ['Small', 'Medium', 'Large', 'Enterprise']) })
  })
    .optional(),
  logo_url: z.string()
    .url(ERROR_MESSAGES.url)
    .trim()
    .optional(),
  verification_status: z.enum(verificationStatusEnum).optional(),
  verified: z.boolean().optional(),
  verification_date: z.string().datetime().optional()
});

// Validation Utilities
export const validateForm = async <T extends z.ZodSchema>(
  schema: T,
  data: unknown
): Promise<{ success: boolean; data?: z.infer<T>; errors?: z.ZodError }> => {
  try {
    const validData = await schema.parseAsync(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};

// Export types
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type CompanyFormData = z.infer<typeof companySchema>;
export type EmploymentStatus = typeof employmentStatusEnum[number];
export type VerificationStatus = typeof verificationStatusEnum[number];
export type ReviewStatus = typeof reviewStatusEnum[number];
export type RateLimitType = typeof rateLimitTypeEnum[number];