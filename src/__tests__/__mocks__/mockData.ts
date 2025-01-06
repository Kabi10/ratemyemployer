import { Database } from '@/types/supabase';

// User mock data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  role: 'user',
  username: 'testuser',
  is_verified: true
};

// Review mock data
export const mockReview: Database['public']['Tables']['reviews']['Row'] = {
  id: 1,
  title: 'Great Company to Work For',
  content: 'This is a detailed review of the company...',
  rating: 4,
  created_at: new Date().toISOString(),
  company_id: 1,
  user_id: mockUser.id,
  pros: 'Good benefits, work-life balance',
  cons: 'Limited growth opportunities',
  position: 'Software Engineer',
  employment_status: 'Full-time',
  is_current_employee: true,
  reviewer_name: 'Test User',
  reviewer_email: 'test@example.com',
  status: 'approved'
};

// Company mock data
export const mockCompany: Database['public']['Tables']['companies']['Row'] = {
  id: 1,
  name: 'Tech Corp Inc',
  description: 'Leading technology company...',
  industry: 'Technology',
  location: 'San Francisco, CA',
  website: 'https://techcorp.example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  logo_url: 'https://example.com/logo.png',
  total_reviews: 25,
  average_rating: 4.2,
  verified: true,
  benefits: 'Great health insurance, 401k matching',
  ceo: 'John Doe',
  company_values: 'Innovation, Integrity, Excellence',
  created_by: mockUser.id,
  recommendation_rate: 85,
  verification_date: new Date().toISOString(),
  verification_status: 'verified'
};

// Mock likes data
export const mockLike = {
  id: 'test-like-id',
  user_id: mockUser.id,
  review_id: mockReview.id,
  created_at: new Date().toISOString()
};

// Mock error responses
export const mockErrors = {
  auth: {
    notAuthenticated: {
      message: 'Not authenticated',
      status: 401
    },
    notAuthorized: {
      message: 'Not authorized',
      status: 403
    }
  },
  validation: {
    invalidInput: {
      message: 'Invalid input data',
      status: 400,
      errors: [
        { field: 'email', message: 'Invalid email format' }
      ]
    }
  },
  server: {
    internal: {
      message: 'Internal server error',
      status: 500
    },
    database: {
      message: 'Database error',
      status: 503
    }
  }
};

// Mock API responses
export const mockApiResponses = {
  success: {
    create: { message: 'Resource created successfully', status: 201 },
    update: { message: 'Resource updated successfully', status: 200 },
    delete: { message: 'Resource deleted successfully', status: 200 }
  },
  error: mockErrors
};

// Mock form data
export const mockForms = {
  review: {
    valid: {
      title: 'Great Company',
      content: 'Detailed review content...',
      rating: 4,
      pros: 'Good benefits',
      cons: 'Long hours',
      position: 'Developer',
      employment_status: 'FULL_TIME'
    },
    invalid: {
      title: '', // Empty title
      content: 'Too short', // Too short content
      rating: 6, // Invalid rating
      pros: '',
      cons: '',
      position: '',
      employment_status: 'INVALID'
    }
  },
  company: {
    valid: {
      name: 'New Tech Corp',
      description: 'Company description...',
      industry: 'Technology',
      location: 'New York, NY',
      website: 'https://example.com',
      size: 'LARGE'
    },
    invalid: {
      name: '', // Empty name
      description: '', // Empty description
      industry: '',
      location: '',
      website: 'invalid-url',
      size: 'INVALID'
    }
  }
};

// Mock Supabase responses
export const mockSupabaseResponses = {
  auth: {
    user: {
      data: { user: mockUser, session: null },
      error: null
    },
    error: {
      data: { user: null, session: null },
      error: { message: 'Authentication error', status: 401 }
    }
  },
  data: {
    success: {
      data: [mockReview],
      error: null
    },
    error: {
      data: null,
      error: { message: 'Database error', code: 'PGRST301' }
    }
  }
};

// Test data factory functions
export const createMockReview = (overrides = {}) => ({
  ...mockReview,
  ...overrides,
  id: `test-review-${Date.now()}`,
  created_at: new Date().toISOString()
});

export const createMockCompany = (overrides = {}) => ({
  ...mockCompany,
  ...overrides,
  id: `test-company-${Date.now()}`,
  created_at: new Date().toISOString()
});

export const createMockUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides,
  id: `test-user-${Date.now()}`,
  created_at: new Date().toISOString()
}); 