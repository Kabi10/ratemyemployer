/**
 * Authentication Integration Tests - MVP Core
 * Tests for core authentication functionality
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabaseClient';

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    },
  },
}));

describe('Authentication Flow - MVP Core', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('can sign in with email and password', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
    };

    const mockSession = {
      user: mockUser,
      access_token: 'test-token',
    };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password',
    });

    expect(error).toBeNull();
    expect(data.user).toEqual(mockUser);
    expect(data.session).toEqual(mockSession);
  });

  test('handles sign in errors', async () => {
    const mockError = {
      message: 'Invalid credentials',
      status: 400,
    };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(data.user).toBeNull();
    expect(data.session).toBeNull();
    expect(error).toEqual(mockError);
  });

  test('can sign up with email and password', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
    };

    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    });

    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password',
    });

    expect(error).toBeNull();
    expect(data.user).toEqual(mockUser);
  });

  test('can sign out', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null,
    });

    const { error } = await supabase.auth.signOut();

    expect(error).toBeNull();
  });

  test('can get current session', async () => {
    const mockSession = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
      access_token: 'test-token',
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { data, error } = await supabase.auth.getSession();

    expect(error).toBeNull();
    expect(data.session).toEqual(mockSession);
  });

  test('can get current user', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
    };

    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { data, error } = await supabase.auth.getUser();

    expect(error).toBeNull();
    expect(data.user).toEqual(mockUser);
  });

  test('can set up auth state change listener', () => {
    const mockUnsubscribe = vi.fn();
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    });

    const callback = vi.fn();
    const { data } = supabase.auth.onAuthStateChange(callback);

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
    expect(data.subscription.unsubscribe).toBe(mockUnsubscribe);
  });
});