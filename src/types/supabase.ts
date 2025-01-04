export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Available user roles in the system */
export type UserRole = 'admin' | 'user';

/** Review status types */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/** Company size types */
export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise';

/** Base timestamp fields for database tables */
interface Timestamps {
  created_at: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          description: string;
          website: string;
          industry: string;
          location: string;
          size: CompanySize | null;
          logo_url: string | null;
          created_at: string;
          created_by: string;
          verified: boolean;
          verification_date: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          name: string;
          description: string;
          website: string;
          industry: string;
          location: string;
          size?: CompanySize | null;
          logo_url?: string | null;
          created_by: string;
          verified?: boolean;
          verification_date?: string | null;
        } & Partial<Timestamps>;
        Update: {
          id?: string;
          name?: string;
          description?: string;
          website?: string;
          industry?: string;
          location?: string;
          size?: CompanySize | null;
          logo_url?: string | null;
          created_by?: string;
          verified?: boolean;
          verification_date?: string | null;
        } & Partial<Timestamps>;
      };
      reviews: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          rating: number;
          title: string;
          content: string;
          pros: string;
          cons: string;
          status: ReviewStatus;
        } & Timestamps;
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          rating: number;
          title: string;
          content: string;
          pros: string;
          cons: string;
          status?: ReviewStatus;
        } & Partial<Timestamps>;
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string;
          rating?: number;
          title?: string;
          content?: string;
          pros?: string;
          cons?: string;
          status?: ReviewStatus;
        } & Partial<Timestamps>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_admin_stats: {
        Args: Record<string, never>;
        Returns: {
          totalCompanies: number;
          totalReviews: number;
          totalUsers: number;
          pendingReviews: number;
        };
      };
    };
    Enums: {
      user_role: UserRole;
    };
  };
  auth: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          user_metadata: {
            role?: UserRole;
            provider?: string;
            providers?: string[];
          };
        };
        Insert: {
          id?: string;
          email: string;
          user_metadata?: {
            role?: UserRole;
            provider?: string;
            providers?: string[];
          };
        };
        Update: {
          id?: string;
          email?: string;
          user_metadata?: {
            role?: UserRole;
            provider?: string;
            providers?: string[];
          };
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
  };
}
