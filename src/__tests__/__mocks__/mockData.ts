import { Database } from '@/lib/database.types';

// User mock data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  role: 'user',
  profile: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg'
  }
};

// Review mock data
export const mockReview: Database['public']['Tables']['reviews']['Row'] = {
  id: 'test-review-id',
  title: 'Great Company to Work For',
  content: 'This is a detailed review of the company...',
  rating: 4,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: mockUser.id,
  company_id: 'test-company-id',
  pros: 'Good benefits, work-life balance',
  cons: 'Limited growth opportunities',
  position: 'Software Engineer',
  employment_status: 'FULL_TIME',
  likes_count: 10,
  is_verified: true,
  location: 'San Francisco, CA'
};

// Company mock data
export const mockCompany: Database['public']['Tables']['companies']['Row'] = {
  id: 'test-company-id',
  name: 'Tech Corp Inc',
  description: 'Leading technology company...',
  industry: 'Technology',
  location: 'San Francisco, CA',
  website: 'https://techcorp.example.com',
  size: 'MEDIUM',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  logo_url: 'https://example.com/logo.png',
  review_count: 25,
  average_rating: 4.2,
  verified: true
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