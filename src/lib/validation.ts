import { z } from 'zod'

export const CompanyReviewSchema = z.object({
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment cannot exceed 500 characters')
    .trim(),
  companyId: z.number().positive('Company ID is required'),
  reviewerId: z.string().uuid('Invalid reviewer ID')
})

export type CompanyReview = z.infer<typeof CompanyReviewSchema>

// Add validation helper
export const validateReview = (data: unknown): CompanyReview => {
  return CompanyReviewSchema.parse(data)
} 