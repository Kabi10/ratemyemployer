'use client'

import * as React from 'react';
import { createContext, useContext, useEffect, useState, type FC, type ReactNode } from 'react';

import { User, Session } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabaseClient';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { syncUserToSupabase } from '@/lib/auth/sync';

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

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, loading, error] = useAuthState(getAuth());

  useEffect(() => {
    if (user) {
      syncUserToSupabase();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const { data: { subscription } } = createClient().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return { user, isLoading, error: null };
};