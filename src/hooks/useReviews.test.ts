import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useReviews } from './useReviews';
import { getReviews } from '@/lib/database';

vi.mock('@/lib/database', () => ({
  getReviews: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

describe('useReviews', () => {
  it('converts string userId to number', async () => {
    renderHook(() => useReviews({ companyId: '1', userId: '2' }));

    await waitFor(() => {
      expect(getReviews).toHaveBeenCalledWith({ companyId: 1, userId: 2 });
    });
  });
});
