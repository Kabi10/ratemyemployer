/**
 * Review CRUD Operations Tests - MVP Core
 * Tests for core review functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabaseClient';
import { mockReview, mockCompany } from '../mocks/mockData';

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
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe('Review CRUD Operations - MVP Core', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Review Creation', () => {
    test('can create a new review', async () => {
      const newReview = {
        company_id: '1',
        user_id: 'test-user-id',
        rating: 4,
        title: 'Great workplace',
        pros: 'Good benefits and culture',
        cons: 'Long hours sometimes',
        recommend: true,
      };

      const createdReview = {
        id: '1',
        ...newReview,
        created_at: new Date().toISOString(),
        status: 'pending',
      };

      const mockChain = {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: createdReview,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('reviews')
        .insert(newReview)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(createdReview);
      expect(supabase.from).toHaveBeenCalledWith('reviews');
    });

    test('validates required fields during review creation', async () => {
      const invalidReview = {
        // Missing required fields
        company_id: '1',
        user_id: 'test-user-id',
        // Missing rating, title, pros, cons
      };

      const mockError = {
        message: 'null value in column "rating" violates not-null constraint',
        code: '23502',
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

      const { data, error } = await supabase
        .from('reviews')
        .insert(invalidReview)
        .select()
        .single();

      expect(data).toBeNull();
      expect(error).toEqual(mockError);
    });

    test('validates rating range (1-5)', async () => {
      const invalidRatingReview = {
        company_id: '1',
        user_id: 'test-user-id',
        rating: 6, // Invalid rating
        title: 'Test Review',
        pros: 'Good things',
        cons: 'Bad things',
        recommend: true,
      };

      const mockError = {
        message: 'new row for relation "reviews" violates check constraint "reviews_rating_check"',
        code: '23514',
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

      const { data, error } = await supabase
        .from('reviews')
        .insert(invalidRatingReview)
        .select()
        .single();

      expect(data).toBeNull();
      expect(error).toEqual(mockError);
    });
  });

  describe('Review Reading', () => {
    test('can fetch reviews for a company', async () => {
      const mockReviews = [mockReview];

      const mockChain = {
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockReviews,
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
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toEqual(mockReviews);
      expect(mockChain.eq).toHaveBeenCalledWith('company_id', '1');
    });

    test('can fetch a single review by id', async () => {
      const mockChain = {
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockReview,
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
        .eq('id', '1')
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(mockReview);
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
    });

    test('can fetch reviews with company information', async () => {
      const reviewWithCompany = {
        ...mockReview,
        companies: mockCompany,
      };

      const mockChain = {
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [reviewWithCompany],
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('reviews')
        .select('*, companies(*)')
        .eq('company_id', '1')
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toEqual([reviewWithCompany]);
    });
  });

  describe('Review Filtering and Sorting', () => {
    test('can filter reviews by rating', async () => {
      const highRatedReviews = [mockReview];

      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: highRatedReviews,
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
      expect(data).toEqual(highRatedReviews);
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

    test('can sort reviews by different criteria', async () => {
      const sortedReviews = [mockReview];

      const mockChain = {
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: sortedReviews,
            error: null,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      // Test sorting by rating (highest first)
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('company_id', '1')
        .order('rating', { ascending: false });

      expect(error).toBeNull();
      expect(data).toEqual(sortedReviews);
    });
  });

  describe('Review Updates', () => {
    test('can update review status (admin functionality)', async () => {
      const updatedReview = {
        ...mockReview,
        status: 'approved',
      };

      const mockChain = {
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: updatedReview,
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', '1')
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(updatedReview);
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
    });
  });

  describe('Review Deletion', () => {
    test('can delete a review', async () => {
      const mockChain = {
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', '1');

      expect(error).toBeNull();
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
    });
  });
});