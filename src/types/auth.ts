import { User, Session } from '@supabase/supabase-js';


export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthError {
  message: string;
  status: number;
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
  error: AuthError | null;
}