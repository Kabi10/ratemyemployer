import * as z from 'zod';
import { INDUSTRIES } from '@/types';

// Enums
export const employmentStatusEnum = ['Full-time', 'Part-time', 'Contract', 'Intern'] as const;
export const verificationStatusEnum = ['pending', 'verified', 'rejected'] as const;
export const reviewStatusEnum = ['pending', 'approved', 'rejected'] as const;
export const rateLimitTypeEnum = ['review', 'company', 'report'] as const;

// Validation Messages
const ERROR_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid website URL',
  min: (field: string, length: number) => `${field} must be at least ${length} characters`,
  max: (field: string, length: number) => `${field} must be less than ${length} characters`,
  rating: 'Rating must be between 1 and 5 stars',
  invalidEnum: (field: string, options: readonly string[]) => 
    `${field} must be one of: ${options.join(', ')}`,
} as const;

// Review Schema
export const reviewSchema = z.object({
  title: z.string()
    .min(2, ERROR_MESSAGES.min('Title', 2))
    .max(100, ERROR_MESSAGES.max('Title', 100))
    .trim(),
  content: z.string()
    .min(10, ERROR_MESSAGES.min('Review', 10))
    .max(2000, ERROR_MESSAGES.max('Review', 2000))
    .trim(),
  rating: z.number()
    .min(1, ERROR_MESSAGES.rating)
    .max(5, ERROR_MESSAGES.rating),
  pros: z.string()
    .max(500, ERROR_MESSAGES.max('Pros', 500))
    .trim()
    .optional(),
  cons: z.string()
    .max(500, ERROR_MESSAGES.max('Cons', 500))
    .trim()
    .optional(),
  position: z.string()
    .min(2, ERROR_MESSAGES.min('Position', 2))
    .max(100, ERROR_MESSAGES.max('Position', 100))
    .trim(),
  employment_status: z.enum(employmentStatusEnum, {
    errorMap: () => ({ message: ERROR_MESSAGES.invalidEnum('Employment status', employmentStatusEnum) })
  }),
  is_current_employee: z.boolean().default(false),
  reviewer_name: z.string().trim().optional(),
  reviewer_email: z.string().email(ERROR_MESSAGES.email).optional(),
  status: z.enum(reviewStatusEnum).default('pending')
});

// Company Schema
export const companySchema = z.object({
  name: z.string()
    .min(2, ERROR_MESSAGES.min('Company name', 2))
    .max(100, ERROR_MESSAGES.max('Company name', 100))
    .trim(),
  description: z.string()
    .min(10, ERROR_MESSAGES.min('Description', 10))
    .max(1000, ERROR_MESSAGES.max('Description', 1000))
    .trim(),
  industry: z.enum(INDUSTRIES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: ERROR_MESSAGES.invalidEnum('Industry', INDUSTRIES) })
  }),
  location: z.string()
    .min(2, ERROR_MESSAGES.min('Location', 2))
    .max(100, ERROR_MESSAGES.max('Location', 100))
    .trim(),
  website: z.string()
    .url(ERROR_MESSAGES.url)
    .trim()
    .optional(),
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