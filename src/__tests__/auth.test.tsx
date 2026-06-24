import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Auth from '../components/Auth';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock supabase client (Auth calls createClient() at render)
vi.mock('../lib/supabaseClient', () => ({
  createClient: () => ({ auth: {} }),
  supabase: { auth: {} },
}));

// Mock AuthContext — useAuth is a real vi.fn so each test can override it
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: vi.fn(() => ({
    user: null,
    session: null,
    isLoading: false,
    error: null,
    isAdmin: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  })),
}));

import { useAuth } from '../contexts/AuthContext';

const baseAuth = () => ({
  user: null,
  session: null,
  isLoading: false,
  error: null,
  isAdmin: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
});

const setAuth = (overrides: Record<string, unknown> = {}) => {
  vi.mocked(useAuth).mockReturnValue({ ...baseAuth(), ...overrides } as ReturnType<typeof useAuth>);
};

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuth();
  });

  describe('Login Flow', () => {
    it('renders login form by default', () => {
      render(<Auth />);
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('handles successful login', async () => {
      const signIn = vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null });
      setAuth({ signIn });

      render(<Auth />);
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('displays loading state during login', () => {
      setAuth({ isLoading: true });
      render(<Auth />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('displays error message on login failure', async () => {
      const signIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
      setAuth({ signIn });

      render(<Auth />);
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sign Up Flow', () => {
    it('switches to signup form', () => {
      render(<Auth />);
      fireEvent.click(screen.getByRole('button', { name: /don't have an account\? sign up/i }));
      expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument();
    });

    it('handles successful signup', async () => {
      const signUp = vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null });
      setAuth({ signUp });

      render(<Auth />);
      fireEvent.click(screen.getByRole('button', { name: /don't have an account\? sign up/i }));
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

      await waitFor(() => {
        expect(signUp).toHaveBeenCalledWith('test@example.com', 'Password123!');
      });
    });

    it('validates password strength', async () => {
      render(<Auth />);
      fireEvent.click(screen.getByRole('button', { name: /don't have an account\? sign up/i }));
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'weak' } });

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });
  });
});
