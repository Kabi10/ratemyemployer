import type { Company, Review, Profile } from '@/types';

export const mockCompany: Company = {
  id: 1,
  name: 'Test Company',
  industry: 'Technology',
  location: 'San Francisco, CA',
  description: 'A test company description',
  website: 'https://test.com',
  logo_url: null,
  created_at: new Date().toISOString(),
  benefits: 'Great benefits',
  company_values: 'Strong values',
  ceo: 'John Doe',
  verification_status: 'pending',
  average_rating: 4.5,
  total_reviews: 10,
  recommendation_rate: 85,
  updated_at: new Date().toISOString(),
  created_by: null,
  verified: false,
  verification_date: null
};

export const mockReview: Review = {
  id: 1,
  company_id: 1,
  user_id: 'test-user-id',
  rating: 4,
  title: 'Great place to work',
  pros: 'Good benefits, great culture',
  cons: 'Work-life balance could be better',
  position: 'Software Engineer',
  employment_status: 'Full-time',
  created_at: new Date().toISOString(),
  status: 'approved',
  content: 'Overall a great experience working here.',
  reviewer_name: 'John Doe',
  reviewer_email: 'john@example.com',
  is_current_employee: true,
  company: mockCompany,
  likes: 5
};

export const mockProfile: Profile = {
  id: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  is_verified: true,
  created_at: new Date().toISOString(),
  role: 'user'
}; 