import { z } from 'zod';
import type { CompanySize, EmploymentStatus, ReviewStatus } from '@/types/database';

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Enums
export const employmentStatusEnum = z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']) satisfies z.ZodType<EmploymentStatus>;
export const reviewStatusEnum = z.enum(['pending', 'approved', 'rejected']) satisfies z.ZodType<ReviewStatus>;
export const companySizeEnum = z.enum(['Small', 'Medium', 'Large', 'Enterprise', 'Startup']) satisfies z.ZodType<CompanySize>;
export const rateLimitTypeEnum = z.enum(['ip', 'user']);

// URL validation regex (matches our database constraint)
const urlRegex = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;

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
  name: 'Company name must be between 2 and 100 characters',
  website: 'Please enter a valid URL',
  industry: 'Please select an industry',
  location: 'Location must be between 2 and 150 characters',
  title: 'Title must be between 3 and 255 characters',
  content: 'Review must be at least 10 characters',
  position: 'Position must be between 2 and 255 characters'
};

// Company schema
export const companySchema = z.object({
  name: z.string()
    .min(2, 'Company name must be between 2 and 100 characters')
    .max(100, 'Company name must be less than 100 characters')
    .transform(val => val.trim()),
  industry: z.enum(["Technology", "Healthcare", "Education", "Finance", "Manufacturing", "Retail", "Other"]),
  location: z.string()
    .min(1, 'Location is required')
    .max(100, 'Location must be less than 100 characters'),
  website: z.string()
    .max(255, 'Website URL must be less than 255 characters')
    .regex(URL_REGEX, 'Invalid website URL')
    .optional()
    .nullable(),
  size: companySizeEnum.optional().nullable(),
  ceo: z.string()
    .max(100, 'CEO name must be less than 100 characters')
    .optional()
    .nullable(),
  benefits: z.string()
    .max(1000, 'Benefits description must be less than 1000 characters')
    .optional()
    .nullable(),
  company_values: z.string()
    .max(1000, 'Company values must be less than 1000 characters')
    .optional()
    .nullable(),
  logo_url: z.string()
    .regex(URL_REGEX, 'Invalid logo URL')
    .max(255, 'Logo URL must be less than 255 characters')
    .optional()
    .nullable(),
  created_at: createOptionalDateSchema('Created date'),
  updated_at: createOptionalDateSchema('Updated date'),
  verification_date: createOptionalDateSchema('Verification date'),
});

// Review schema
export const reviewSchema = z.object({
  company_id: z.number().int().positive('Invalid company ID'),
  rating: z.number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  pros: z.string().min(10),
  cons: z.string().min(10),
  position: z.string()
    .min(1, 'Position is required')
    .max(100, 'Position must be less than 100 characters'),
  employment_status: employmentStatusEnum,
  is_current_employee: z.boolean(),
  status: reviewStatusEnum.default('pending'),
  reviewer_name: z.string()
    .max(100, 'Reviewer name must be less than 100 characters')
    .optional()
    .nullable(),
  reviewer_email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .nullable(),
  created_at: createOptionalDateSchema('Created date'),
  updated_at: createOptionalDateSchema('Updated date'),
  recommend: z.boolean().optional().nullable(),
  content: z.string().min(10, 'Content must be at least 10 characters').optional().nullable(),
});

// Database verification schemas with proper datetime handling
export const companyVerificationSchema = z.object({
  id: z.number(),
  name: z.string().min(2),
  industry: z.string().nullable().optional(),
  location: z.string().min(1),
  created_at: createOptionalDateSchema('Created date'),
  created_by: z.string().uuid().nullable().optional(),
  website: z.string().url().nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  average_rating: z.number().min(0).max(5).nullable().optional(),
  total_reviews: z.number().min(0).nullable().optional(),
  updated_at: createOptionalDateSchema('Updated date'),
  verified: z.boolean().optional(),
  verification_date: createOptionalDateSchema('Verification date'),
});

export const reviewVerificationSchema = z.object({
  id: z.number(),
  company_id: z.number().nullable().optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
  title: z.string().nullable().optional(),
  pros: z.string().nullable().optional(),
  cons: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  created_at: createOptionalDateSchema('Created date'),
  updated_at: createOptionalDateSchema('Updated date'),
  user_id: z.string().uuid().nullable().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).nullable().optional(),
  recommend: z.boolean().nullable().optional(),
  is_current_employee: z.boolean().nullable().optional(),
});

// Safe date parsing utility
export const safeDateParse = (dateValue: unknown): Date | null => {
  if (!dateValue) return null;
  
  try {
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  } catch {
    return null;
  }
};

// Validation utility with better error handling
export const validateFormWithDateHandling = async <T extends z.ZodSchema>(
  schema: T,
  data: unknown
): Promise<{ success: boolean; data?: z.infer<T>; errors?: z.ZodError }> => {
  try {
    // Pre-process dates in the data
    const processedData = preprocessDates(data);
    const validData = await schema.parseAsync(processedData);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};

// Helper to preprocess date fields
function preprocessDates(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  
  const processed = { ...data as Record<string, unknown> };
  
  // Common date fields to process
  const dateFields = ['created_at', 'updated_at', 'verification_date'];
  
  for (const field of dateFields) {
    if (processed[field]) {
      const safeDate = safeDateParse(processed[field]);
      processed[field] = safeDate?.toISOString() || null;
    }
  }
  
  return processed;
}

// Form data types
export type CompanyFormData = z.infer<typeof companySchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;