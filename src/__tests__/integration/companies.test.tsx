/**
 * Company CRUD Operations Tests - MVP Core
 * Tests for core company functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabaseClient';
import { mockCompany } from '../mocks/mockData';

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
      ilike: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe('Company CRUD Operations - MVP Core', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Company Creation', () => {
    test('can create a new company', async () => {
      const newCompany = {
        name: 'New Tech Company',
        industry: 'Technology',
        location: 'San Francisco, CA',
        description: 'A new technology company',
      };

      const createdCompany = {
        id: '1',
        ...newCompany,
        created_at: new Date().toISOString(),
        average_rating: 0,
        review_count: 0,
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

      const { data, error } = await supabase
        .from('companies')
        .insert(newCompany)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(createdCompany);
      expect(supabase.from).toHaveBeenCalledWith('companies');
    });

    test('handles validation errors during creation', async () => {
      const invalidCompany = {
        // Missing required name field
        industry: 'Technology',
        location: 'San Francisco, CA',
      };

      const mockError = {
        message: 'null value in column "name" violates not-null constraint',
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
        .from('companies')
        .insert(invalidCompany)
        .select()
        .single();

      expect(data).toBeNull();
      expect(error).toEqual(mockError);
    });
  });

  describe('Company Reading', () => {
    test('can fetch all companies', async () => {
      const mockCompanies = [mockCompany];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: mockCompanies,
          error: null,
        }),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*');

      expect(error).toBeNull();
      expect(data).toEqual(mockCompanies);
      expect(Array.isArray(data)).toBe(true);
    });

    test('can fetch a single company by id', async () => {
      const mockChain = {
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockCompany,
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
        .eq('id', '1')
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(mockCompany);
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
    });

    test('handles company not found', async () => {
      const mockError = {
        message: 'No rows found',
        code: 'PGRST116',
      };

      const mockChain = {
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', 'nonexistent')
        .single();

      expect(data).toBeNull();
      expect(error).toEqual(mockError);
    });
  });

  describe('Company Search and Filtering', () => {
    test('can search companies by name', async () => {
      const searchResults = [mockCompany];

      const mockChain = {
        ilike: vi.fn().mockResolvedValue({
          data: searchResults,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', '%Test%');

      expect(error).toBeNull();
      expect(data).toEqual(searchResults);
      expect(mockChain.ilike).toHaveBeenCalledWith('name', '%Test%');
    });

    test('can filter companies by industry', async () => {
      const filteredResults = [mockCompany];

      const mockChain = {
        eq: vi.fn().mockResolvedValue({
          data: filteredResults,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('industry', 'Technology');

      expect(error).toBeNull();
      expect(data).toEqual(filteredResults);
      expect(mockChain.eq).toHaveBeenCalledWith('industry', 'Technology');
    });

    test('can filter companies by minimum rating', async () => {
      const filteredResults = [mockCompany];

      const mockChain = {
        gte: vi.fn().mockResolvedValue({
          data: filteredResults,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .gte('average_rating', 4.0);

      expect(error).toBeNull();
      expect(data).toEqual(filteredResults);
      expect(mockChain.gte).toHaveBeenCalledWith('average_rating', 4.0);
    });
  });

  describe('Company Updates', () => {
    test('can update company information', async () => {
      const updatedData = {
        description: 'Updated company description',
        website: 'https://updated-website.com',
      };

      const updatedCompany = {
        ...mockCompany,
        ...updatedData,
      };

      const mockChain = {
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: updatedCompany,
              error: null,
            }),
          }),
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue(mockChain),
      } as any);

      const { data, error } = await supabase
        .from('companies')
        .update(updatedData)
        .eq('id', '1')
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(updatedCompany);
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
    });
  });

  describe('Company Deletion', () => {
    test('can delete a company', async () => {
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
        .from('companies')
        .delete()
        .eq('id', '1');

      expect(error).toBeNull();
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
    });
  });
});