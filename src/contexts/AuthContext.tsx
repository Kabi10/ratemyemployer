'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabaseClient';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const supabase = createClient();
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setSession(session);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error initializing auth');
      } finally {
        setIsLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setSession(session);
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    };

    initializeAuth();
  }, []);

  const isAdmin = user?.user_metadata?.role === 'admin';

  const value = {
    user,
    session,
    isLoading,
    error,
    isAdmin,
    signIn: async (email: string, password: string) => {
      const supabase = createClient();
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign in failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    signUp: async (email: string, password: string) => {
      const supabase = createClient();
      setIsLoading(true);
      setError(null);
      try {
        console.log('Starting signup in AuthContext...');

        // First check if user exists using sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: 'dummy-check-password'
        });

        // If we get an "Invalid credentials" error, it means the email exists
        // (because the password is wrong but the email exists)
        if (signInError?.message?.includes('Invalid login credentials')) {
          console.log('User exists check:', signInError);
          const error = new Error('Email address already taken');
          setError(error.message);
          return { error };
        }

        // If we get here, try to sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) {
          console.error('Signup error:', error);
          setError(error.message);
          return { error };
        }

        if (!data?.user) {
          console.error('No user data received');
          const error = new Error('Failed to create account');
          setError(error.message);
          return { error };
        }

        return { data };
      } catch (err: any) {
        console.error('Signup error:', err);
        setError(err instanceof Error ? err.message : 'Sign up failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    signOut: async () => {
      const supabase = createClient();
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign out failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};