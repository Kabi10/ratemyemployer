import { Database } from '@/lib/database.types';

export type TestUser = Database['public']['Tables']['users']['Row'];
export type TestReview = Database['public']['Tables']['reviews']['Row'];
export type TestCompany = Database['public']['Tables']['companies']['Row'];