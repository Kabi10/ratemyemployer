'use client'

import { createContext, useContext, useEffect, useState, type FC, type ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { Role } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isModerator: boolean;
  getUserRole: () => Role;
  hasRole: (requiredRole: Role) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [userRole, setUserRole] = useState<Role>('user');

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        if (!user) {
          setIsAdmin(false);
          setIsModerator(false);
          setUserRole('user');
          return;
        }

        // Get user metadata
        const { data: userData } = await supabase.auth.getUser();
        const role = userData?.user?.user_metadata?.role as Role || 'user';
        
        setIsAdmin(role === 'admin');
        setIsModerator(role === 'moderator' || role === 'admin');
        setUserRole(role);
        
        // Also check admins table for backward compatibility
        if (!isAdmin) {
          const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (adminData) {
            setIsAdmin(true);
            setIsModerator(true);
            setUserRole('admin');
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, [user, isAdmin]);

  // Get user role
  const getUserRole = (): Role => {
    return userRole;
  };
  
  // Check if user has required role
  const hasRole = (requiredRole: Role): boolean => {
    if (!user) return false;
    
    switch (requiredRole) {
      case 'admin':
        return isAdmin;
      case 'moderator':
        return isModerator;
      case 'user':
        return true;
      default:
        return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign in');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during Google sign in');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return { data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign up');
      return { error: error instanceof Error ? error : new Error('An error occurred during sign up') };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign out');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        error,
        isAdmin,
        isModerator,
        getUserRole,
        hasRole,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;