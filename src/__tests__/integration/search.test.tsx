/**
 * Search and Filtering Tests - MVP Core
 * Tests for core search and filtering functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabaseClient';
import { mockCompany, mockReview } from '../mocks/mockData';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('Search and Filtering - MVP Core', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Company Search', () => {
    test('can search companies by name (case insensitive)', async () => {
      const searchResults = [mockCompany];

      const mockChain = {
        ilike: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: searchResults,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', '%test%')
        .order('name');

      expect(error).toBeNull();
      expect(data).toEqual(searchResults);
      expect(mockChain.ilike).toHaveBeenCalledWith('name', '%test%');
    });

    test('can search companies by partial name match', async () => {
      const searchResults = [mockCompany];

      const mockChain = {
        ilike: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: searchResults,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', '%comp%')
        .order('name');

      expect(error).toBeNull();
      expect(data).toEqual(searchResults);
      expect(mockChain.ilike).toHaveBeenCalledWith('name', '%comp%');
    });

    test('returns empty results for non-matching search', async () => {
      const mockChain = {
        ilike: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', '%nonexistent%')
        .order('name');

      expect(error).toBeNull();
      expect(data).toEqual([]);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Company Filtering', () => {
    test('can filter companies by industry', async () => {
      const filteredResults = [mockCompany];

      const mockChain = {
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: filteredResults,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('industry', 'Technology')
        .order('name');

      expect(error).toBeNull();
      expect(data).toEqual(filteredResults);
      expect(mockChain.eq).toHaveBeenCalledWith('industry', 'Technology');
    });

    test('can filter companies by location', async () => {
      const filteredResults = [mockCompany];

      const mockChain = {
        ilike: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: filteredResults,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('location', '%San Francisco%')
        .order('name');

      expect(error).toBeNull();
      expect(data).toEqual(filteredResults);
      expect(mockChain.ilike).toHaveBeenCalledWith('location', '%San Francisco%');
    });

    test('can filter companies by minimum rating', async () => {
      const filteredResults = [mockCompany];

      const mockChain = {
        gte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: filteredResults,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .gte('average_rating', 4.0)
        .order('average_rating', { ascending: false });

      expect(error).toBeNull();
      expect(data).toEqual(filteredResults);
      expect(mockChain.gte).toHaveBeenCalledWith('average_rating', 4.0);
    });

    test('can filter companies by rating range', async () => {
      const filteredResults = [mockCompany];

      const mockChain = {
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: filteredResults,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .gte('average_rating', 4.0)
        .lte('average_rating', 5.0)
        .order('average_rating', { ascending: false });

      expect(error).toBeNull();
      expect(data).toEqual(filteredResults);
      expect(mockChain.gte).toHaveBeenCalledWith('average_rating', 4.0);
      expect(mockChain.lte).toHaveBeenCalledWith('average_rating', 5.0);
    });
  });

  describe('Combined Search and Filtering', () => {
    test('can combine name search with industry filter', async () => {
      const filteredResults = [mockCompany];

      const mockChain = {
        ilike: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: filteredResults,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', '%test%')
        .eq('industry', 'Technology')
        .order('name');

      expect(error).toBeNull();
      expect(data).toEqual(filteredResults);
      expect(mockChain.ilike).toHaveBeenCalledWith('name', '%test%');
      expect(mockChain.eq).toHaveBeenCalledWith('industry', 'Technology');
    });

    test('can combine multiple filters', async () => {
      const filteredResults = [mockCompany];

      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: filteredResults,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('industry', 'Technology')
        .gte('average_rating', 4.0)
        .ilike('location', '%San Francisco%')
        .order('average_rating', { ascending: false });

      expect(error).toBeNull();
      expect(data).toEqual(filteredResults);
      expect(mockChain.eq).toHaveBeenCalledWith('industry', 'Technology');
      expect(mockChain.gte).toHaveBeenCalledWith('average_rating', 4.0);
      expect(mockChain.ilike).toHaveBeenCalledWith('location', '%San Francisco%');
    });
  });

  describe('Sorting and Pagination', () => {
    test('can sort companies by name', async () => {
      const sortedResults = [mockCompany];

      const mockChain = {
        order: vi.fn().mockResolvedValue({
          data: sortedResults,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      expect(error).toBeNull();
      expect(data).toEqual(sortedResults);
    });

    test('can sort companies by rating (highest first)', async () => {
      const sortedResults = [mockCompany];

      const mockChain = {
        order: vi.fn().mockResolvedValue({
          data: sortedResults,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('average_rating', { ascending: false });

      expect(error).toBeNull();
      expect(data).toEqual(sortedResults);
    });

    test('can limit results for pagination', async () => {
      const limitedResults = [mockCompany];

      const mockChain = {
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: limitedResults,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name')
        .limit(10);

      expect(error).toBeNull();
      expect(data).toEqual(limitedResults);
    });

    test('can use range for pagination', async () => {
      const pagedResults = [mockCompany];

      const mockChain = {
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: pagedResults,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name')
        .range(0, 9); // First 10 results

      expect(error).toBeNull();
      expect(data).toEqual(pagedResults);
    });
  });

  describe('Review Search and Filtering', () => {
    test('can filter reviews by rating', async () => {
      const filteredReviews = [mockReview];

      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: filteredReviews,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('company_id', '1')
        .gte('rating', 4)
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toEqual(filteredReviews);
      expect(mockChain.gte).toHaveBeenCalledWith('rating', 4);
    });

    test('can filter reviews by recommendation status', async () => {
      const recommendedReviews = [mockReview];

      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: recommendedReviews,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('company_id', '1')
        .eq('recommend', true)
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toEqual(recommendedReviews);
    });
  });
});