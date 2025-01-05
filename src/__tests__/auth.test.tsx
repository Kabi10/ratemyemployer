import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Auth from '../components/Auth';
import { AuthProvider } from '../contexts/AuthContext';
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '../lib/supabaseClient';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => {
  const mockSignIn = vi.fn();
  const mockSignUp = vi.fn();
  const mockSignOut = vi.fn();

  return {
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: () => ({
      user: null,
      session: null,
      isLoading: false,
      error: null,
      isAdmin: false,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: mockSignOut,
    }),
  };
});

// Mock supabaseClient with a partial implementation
vi.mock('../lib/supabaseClient', () => {
  const mockAuth = {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
    setSession: vi.fn(),
    admin: {
      listUsers: vi.fn(),
    },
    mfa: {
      enroll: vi.fn(),
    },
    resetPasswordForEmail: vi.fn(),
    verifyOtp: vi.fn(),
    updateUser: vi.fn(),
    resend: vi.fn(),
    reauthenticate: vi.fn(),
    listIdentities: vi.fn(),
    deleteIdentity: vi.fn(),
    createUser: vi.fn(),
    deleteUser: vi.fn(),
    listUsers: vi.fn(),
    getUserById: vi.fn(),
    updateUserById: vi.fn(),
    generateLink: vi.fn(),
    inviteUserByEmail: vi.fn(),
    sendMobileOTP: vi.fn(),
    verifyMobileOTP: vi.fn(),
    verifyEmailOTP: vi.fn(),
    signInWithOAuth: vi.fn(),
    signInWithOtp: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    linkIdentity: vi.fn(),
    unlinkIdentity: vi.fn(),
    getIdentitiesByUserId: vi.fn(),
    deleteIdentityByUserId: vi.fn(),
    generateRecoveryCodes: vi.fn(),
    verifyRecoveryCode: vi.fn(),
    listFactors: vi.fn(),
    deleteFactor: vi.fn(),
    challengeFactor: vi.fn(),
    verifyChallenge: vi.fn(),
    listRecoveryCodes: vi.fn(),
    updateRecoveryCodes: vi.fn(),
    verifyEmailChange: vi.fn(),
    verifyPhoneChange: vi.fn(),
    verifyPasswordReset: vi.fn(),
    verifyEmailUpdate: vi.fn(),
    verifyPhoneUpdate: vi.fn(),
    verifyPasswordUpdate: vi.fn(),
    verifyEmailDelete: vi.fn(),
    verifyPhoneDelete: vi.fn(),
    verifyPasswordDelete: vi.fn(),
    verifyEmailVerification: vi.fn(),
    verifyPhoneVerification: vi.fn(),
    verifyPasswordVerification: vi.fn(),
    verifyEmailRecovery: vi.fn(),
    verifyPhoneRecovery: vi.fn(),
    verifyPasswordRecovery: vi.fn(),
    verifyEmailInvite: vi.fn(),
    verifyPhoneInvite: vi.fn(),
    verifyPasswordInvite: vi.fn(),
    verifyEmailSignIn: vi.fn(),
    verifyPhoneSignIn: vi.fn(),
    verifyPasswordSignIn: vi.fn(),
    verifyEmailSignUp: vi.fn(),
    verifyPhoneSignUp: vi.fn(),
    verifyPasswordSignUp: vi.fn(),
    verifyEmailSignOut: vi.fn(),
    verifyPhoneSignOut: vi.fn(),
    verifyPasswordSignOut: vi.fn(),
    verifyEmailMfa: vi.fn(),
    verifyPhoneMfa: vi.fn(),
    verifyPasswordMfa: vi.fn(),
    verifyEmailLink: vi.fn(),
    verifyPhoneLink: vi.fn(),
    verifyPasswordLink: vi.fn(),
    verifyEmailUnlink: vi.fn(),
    verifyPhoneUnlink: vi.fn(),
    verifyPasswordUnlink: vi.fn(),
    verifyEmailChallenge: vi.fn(),
    verifyPhoneChallenge: vi.fn(),
    verifyPasswordChallenge: vi.fn(),
    verifyEmailFactor: vi.fn(),
    verifyPhoneFactor: vi.fn(),
    verifyPasswordFactor: vi.fn(),
    verifyEmailRecoveryCode: vi.fn(),
    verifyPhoneRecoveryCode: vi.fn(),
    verifyPasswordRecoveryCode: vi.fn(),
    instanceID: 'test-instance',
    storageKey: 'test-storage-key',
  };

  return {
    createClient: () => ({
      auth: mockAuth,
    }),
  };
});

// Helper function to render Auth component
const renderAuth = () => {
  return render(<Auth />);
};

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('renders login form by default', () => {
      renderAuth();
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('handles successful login', async () => {
      const { useAuth } = await import('../contexts/AuthContext');
      const mockSignIn = vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null });
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        error: null,
        isAdmin: false,
        signIn: mockSignIn,
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      renderAuth();
      
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByText(/sign in/i));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('displays loading state during login', async () => {
      const { useAuth } = await import('../contexts/AuthContext');
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        isLoading: true,
        error: null,
        isAdmin: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      renderAuth();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('displays error message on login failure', async () => {
      const { useAuth } = await import('../contexts/AuthContext');
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        error: 'Invalid credentials',
        isAdmin: false,
        signIn: mockSignIn,
        signUp: vi.fn(),
        signOut: vi.fn(),
      });

      renderAuth();
      
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
      fireEvent.click(screen.getByText(/sign in/i));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sign Up Flow', () => {
    it('switches to signup form', () => {
      renderAuth();
      fireEvent.click(screen.getByText(/don't have an account\? sign up/i));
      expect(screen.getByText(/create account/i)).toBeInTheDocument();
    });

    it('handles successful signup', async () => {
      const { useAuth } = await import('../contexts/AuthContext');
      const mockSignUp = vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null });
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        error: null,
        isAdmin: false,
        signIn: vi.fn(),
        signUp: mockSignUp,
        signOut: vi.fn(),
      });

      renderAuth();
      
      fireEvent.click(screen.getByText(/don't have an account\? sign up/i));
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
      fireEvent.click(screen.getByText(/create account/i));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'Password123!');
      });
    });

    it('validates email format', async () => {
      renderAuth();
      
      fireEvent.click(screen.getByText(/don't have an account\? sign up/i));
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalidemail' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
      fireEvent.click(screen.getByText(/create account/i));

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });

    it('validates password strength', async () => {
      renderAuth();
      
      fireEvent.click(screen.getByText(/don't have an account\? sign up/i));
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'weak' } });
      fireEvent.click(screen.getByText(/create account/i));

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });
  });
}); 