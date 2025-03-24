import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Auth from '@/components/Auth/Auth';
import { AuthProvider } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabaseClient';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock supabaseClient
vi.mock('@/lib/supabaseClient', () => ({
  createClient: vi.fn(() => ({
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  })),
}));

describe('Auth Component', () => {
  const mockSignIn = vi.fn();
  const mockSignUp = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAuth = () => {
    return render(
      <AuthProvider value={{ signIn: mockSignIn, signUp: mockSignUp, isLoading: false }}>
        <Auth />
      </AuthProvider>
    );
  };

  describe('Sign In', () => {
    it('renders sign in form by default', () => {
      renderAuth();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('handles sign in submission', async () => {
      renderAuth();
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'Password123!' },
      });
      
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'Password123!');
      });
    });

    it('displays error message on invalid credentials', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Invalid login credentials'));
      renderAuth();
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'wrongpassword' },
      });
      
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Sign Up', () => {
    beforeEach(() => {
      renderAuth();
      fireEvent.click(screen.getByText('Sign Up'));
    });

    it('switches to sign up mode', () => {
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('validates password requirements', async () => {
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'weak' },
      });
      
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });
    });

    it('handles successful sign up', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { email: 'test@example.com', email_confirmed_at: null } },
        error: null,
      });

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'ValidPass123!' },
      });
      
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });
    });
  });

  describe('Password Reset', () => {
    it('handles forgot password flow', async () => {
      const mockResetPasswordForEmail = vi.fn().mockResolvedValueOnce({ error: null });
      (createClient as vi.Mock).mockImplementation(() => ({
        auth: {
          resetPasswordForEmail: mockResetPasswordForEmail,
        },
      }));

      renderAuth();
      fireEvent.click(screen.getByText('Forgot Password?'));
      
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
      });
      
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          expect.any(Object)
        );
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });
    });
  });
}); 