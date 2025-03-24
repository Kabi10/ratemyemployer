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
  title: 'Title must be between 3 and 100 characters',
  content: 'Review must be at least 10 characters',
  position: 'Position must be between 2 and 100 characters',
  pros: 'Pros must be at least 10 characters',
  cons: 'Cons must be at least 10 characters'
};

// Company schema
export const companySchema = z.object({
  name: z.string()
    .min(2, ERROR_MESSAGES.name)
    .max(100, ERROR_MESSAGES.name),
  industry: z.string().min(1, ERROR_MESSAGES.industry),
  location: z.string()
    .min(1, 'Location is required')
    .max(100, 'Location must be less than 100 characters'),
  website: z.string()
    .url(ERROR_MESSAGES.url)
    .regex(urlRegex, ERROR_MESSAGES.website)
    .optional()
    .or(z.literal('')),
  size: z.string().optional(),
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
});

// Review schema
export const reviewSchema = z.object({
  company_id: z.number().int().positive('Invalid company ID'),
  rating: z.number()
    .min(1, ERROR_MESSAGES.rating)
    .max(5, ERROR_MESSAGES.rating),
  title: z.string()
    .min(5, ERROR_MESSAGES.min('Title', 5))
    .max(100, ERROR_MESSAGES.max('Title', 100)),
  pros: z.string()
    .min(10, ERROR_MESSAGES.pros)
    .max(2000, ERROR_MESSAGES.max('Pros', 2000)),
  cons: z.string()
    .min(10, ERROR_MESSAGES.cons)
    .max(2000, ERROR_MESSAGES.max('Cons', 2000)),
  position: z.string()
    .min(2, ERROR_MESSAGES.min('Position', 2))
    .max(100, ERROR_MESSAGES.max('Position', 100)),
  employment_status: employmentStatusEnum,
  is_current_employee: z.boolean(),
  status: reviewStatusEnum.default('pending'),
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

// Form data types
export type CompanyFormData = z.infer<typeof companySchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;