import { Database } from '@/types/supabase';

export type TestUser = Database['public']['Tables']['user_profiles']['Row'];
export type TestReview = Database['public']['Tables']['reviews']['Row'];
export type TestCompany = Database['public']['Tables']['companies']['Row'];