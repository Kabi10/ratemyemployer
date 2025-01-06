import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/components/ThemeProvider';
import { vi } from 'vitest';
import { createContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ 
    error?: Error; 
    data?: { 
      user: User | null; 
      session: Session | null; 
    }; 
  }>;
  signOut: () => Promise<void>;
}

// Create a mock context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock auth context value
const mockAuthContext: AuthContextType = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'authenticated',
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {
      provider: 'email',
    },
    user_metadata: {},
    identities: [],
    updated_at: new Date().toISOString(),
  } as User,
  session: {
    access_token: 'test-token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'test-refresh-token',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'authenticated',
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      app_metadata: {
        provider: 'email',
      },
      user_metadata: {},
      identities: [],
      updated_at: new Date().toISOString(),
    } as User,
  } as Session,
  isLoading: false,
  error: null,
  isAdmin: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
};

// Custom render function that includes providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          {children}
        </AuthContext.Provider>
      </ThemeProvider>
    );
  };

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  };
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
export { mockAuthContext };