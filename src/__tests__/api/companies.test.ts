/**
 * Companies API Tests
 * Comprehensive test suite for companies API endpoints
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/companies/route';
import { supabase } from '@/lib/supabaseClient';

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          limit: vi.fn(),
          order: vi.fn(),
        })),
        ilike: vi.fn(() => ({
          eq: vi.fn(),
          gte: vi.fn(),
        })),
        gte: vi.fn(),
        order: vi.fn(),
        limit: vi.fn(),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

describe.skip('/api/companies', () => {
  // TODO: Re-enable when API route testing is configured with Next.js request context
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/companies', () => {
    test('returns all companies when no filters applied', async () => {
      const mockCompanies = [
        {
          id: 1,
          name: 'Test Company 1',
          industry: 'Technology',
          location: 'San Francisco, CA',
          average_rating: 4.5,
        },
        {
          id: 2,
          name: 'Test Company 2',
          industry: 'Finance',
          location: 'New York, NY',
          average_rating: 3.8,
        },
      ];

      const mockQuery = {
        data: mockCompanies,
        error: null,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockQuery),
      } as any);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/companies',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCompanies);
      expect(supabase.from).toHaveBeenCalledWith('companies');
    });

    test('filters companies by search term', async () => {
      const mockCompanies = [
        {
          id: 1,
          name: 'Google',
          industry: 'Technology',
          location: 'Mountain View, CA',
        },
      ];

      const mockChain = {
        ilike: vi.fn().mockReturnThis(),
        data: mockCompanies,
        error: null,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/companies?search=Google',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockChain.ilike).toHaveBeenCalledWith('name', '%Google%');
    });

    test('filters companies by industry', async () => {
      const mockCompanies = [
        {
          id: 1,
          name: 'Tech Company',
          industry: 'Technology',
          location: 'San Francisco, CA',
        },
      ];

      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        data: mockCompanies,
        error: null,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/companies?industry=Technology',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockChain.eq).toHaveBeenCalledWith('industry', 'Technology');
    });

    test('filters companies by minimum rating', async () => {
      const mockCompanies = [
        {
          id: 1,
          name: 'High Rated Company',
          average_rating: 4.5,
        },
      ];

      const mockChain = {
        gte: vi.fn().mockReturnThis(),
        data: mockCompanies,
        error: null,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/companies?minRating=4.0',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockChain.gte).toHaveBeenCalledWith('average_rating', '4.0');
    });

    test('handles database errors gracefully', async () => {
      const mockError = {
        message: 'Database connection failed',
        code: 'CONNECTION_ERROR',
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      } as any);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/companies',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe(mockError.message);
    });

    test('applies multiple filters correctly', async () => {
      const mockCompanies = [
        {
          id: 1,
          name: 'Google',
          industry: 'Technology',
          average_rating: 4.5,
        },
      ];

      const mockChain = {
        ilike: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        data: mockCompanies,
        error: null,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/companies?search=Google&industry=Technology&minRating=4.0',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockChain.ilike).toHaveBeenCalledWith('name', '%Google%');
      expect(mockChain.eq).toHaveBeenCalledWith('industry', 'Technology');
      expect(mockChain.gte).toHaveBeenCalledWith('average_rating', '4.0');
    });
  });

  describe('POST /api/companies', () => {
    test('creates a new company successfully', async () => {
      const newCompany = {
        name: 'New Company',
        industry: 'Technology',
        location: 'San Francisco, CA',
        website: 'https://newcompany.com',
        description: 'A new technology company',
      };

      const createdCompany = {
        id: 1,
        ...newCompany,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockChain = {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: createdCompany,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { req } = createMocks({
        method: 'POST',
        url: '/api/companies',
        body: newCompany,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdCompany);
    });

    test('validates required fields', async () => {
      const invalidCompany = {
        industry: 'Technology',
        location: 'San Francisco, CA',
        // Missing required 'name' field
      };

      const { req } = createMocks({
        method: 'POST',
        url: '/api/companies',
        body: invalidCompany,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('validation');
    });

    test('handles duplicate company names', async () => {
      const duplicateCompany = {
        name: 'Existing Company',
        industry: 'Technology',
        location: 'San Francisco, CA',
      };

      const mockError = {
        message: 'duplicate key value violates unique constraint',
        code: '23505',
      };

      const mockChain = {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { req } = createMocks({
        method: 'POST',
        url: '/api/companies',
        body: duplicateCompany,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain('already exists');
    });

    test('sanitizes input data', async () => {
      const companyWithXSS = {
        name: '<script>alert("xss")</script>Malicious Company',
        industry: 'Technology',
        location: 'San Francisco, CA',
        description: '<img src="x" onerror="alert(1)">',
      };

      const sanitizedCompany = {
        id: 1,
        name: 'Malicious Company',
        industry: 'Technology',
        location: 'San Francisco, CA',
        description: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockChain = {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: sanitizedCompany,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { req } = createMocks({
        method: 'POST',
        url: '/api/companies',
        body: companyWithXSS,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).not.toContain('<script>');
      expect(data.description).not.toContain('onerror');
    });
  });

  describe('Error Handling', () => {
    test('handles malformed JSON requests', async () => {
      const { req } = createMocks({
        method: 'POST',
        url: '/api/companies',
        headers: {
          'content-type': 'application/json',
        },
        body: 'invalid json',
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid JSON');
    });

    test('handles network timeouts', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockRejectedValue(new Error('Network timeout')),
      } as any);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/companies',
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Network timeout');
    });
  });

  describe('Performance', () => {
    test('limits query results appropriately', async () => {
      const mockChain = {
        limit: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        data: [],
        error: null,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/companies?limit=50',
      });

      await GET(req as any);

      expect(mockChain.limit).toHaveBeenCalledWith(50);
    });

    test('applies proper ordering for consistent results', async () => {
      const mockChain = {
        order: vi.fn().mockReturnThis(),
        data: [],
        error: null,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/companies',
      });

      await GET(req as any);

      expect(mockChain.order).toHaveBeenCalledWith('name');
    });
  });
});
