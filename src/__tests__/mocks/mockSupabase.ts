import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type ChainableMock = {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  ilike: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  lte: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  then: ReturnType<typeof vi.fn>;
};

// Create a simple mock response
const mockResponse = {
  data: null,
  error: null,
};

// Create a simple chainable mock
const createChainableMock = (): ChainableMock => {
  const chainable: ChainableMock = {
    select: vi.fn(() => chainable),
    insert: vi.fn(() => chainable),
    update: vi.fn(() => chainable),
    delete: vi.fn(() => chainable),
    eq: vi.fn(() => chainable),
    ilike: vi.fn(() => chainable),
    gte: vi.fn(() => chainable),
    lte: vi.fn(() => chainable),
    single: vi.fn(() => chainable),
    order: vi.fn(() => chainable),
    limit: vi.fn(() => chainable),
    range: vi.fn(() => chainable),
    then: vi.fn((callback) => Promise.resolve(callback(mockResponse))),
  };
  return chainable;
};

// Create mock Supabase client
export const mockSupabaseClient = {
  from: vi.fn((table: string) => createChainableMock()),
  auth: {
    signInWithPassword: vi.fn(() => Promise.resolve(mockResponse)),
    signUp: vi.fn(() => Promise.resolve(mockResponse)),
    signOut: vi.fn(() => Promise.resolve(mockResponse)),
    getSession: vi.fn(() => Promise.resolve(mockResponse)),
    onAuthStateChange: vi.fn(() => ({ unsubscribe: vi.fn() })),
  },
} as unknown as SupabaseClient<Database>; 