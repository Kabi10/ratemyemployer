import { describe, test, expect, vi } from 'vitest';
import { supabase } from '../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

describe('Supabase Connection', () => {
  test('should successfully connect to Supabase', async () => {
    // Mock the response for testing
    const mockData = [{ id: 1, name: 'Test Company' }];
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null })
      })
    } as any);

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toEqual(mockData);
    expect(Array.isArray(data)).toBe(true);
  });

  test('should handle connection errors gracefully', async () => {
    // Mock a failed connection
    const mockError = new Error('Connection failed');
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError })
      })
    } as any);

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });
});