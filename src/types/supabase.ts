export const DatabaseEnums = {
  employment_status: ['Full-time', 'Part-time', 'Contract', 'Intern'],
  review_status: ['pending', 'approved', 'rejected'],
  verification_status: ['pending', 'verified', 'rejected'],
  rate_limit_type: ['review', 'company'],
  role: ['user', 'admin', 'moderator']
} as const;

export type EmploymentStatus = typeof DatabaseEnums.employment_status[number];
export type ReviewStatus = typeof DatabaseEnums.review_status[number];
export type VerificationStatus = typeof DatabaseEnums.verification_status[number];
export type RateLimitType = typeof DatabaseEnums.rate_limit_type[number];
export type Role = typeof DatabaseEnums.role[number];

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number
          name: string
          industry: string | null
          website: string | null
          logo_url: string | null
          created_at: string
          benefits: string | null
          company_values: string | null
          ceo: string | null
          verification_status: VerificationStatus
          average_rating: number
          total_reviews: number
          description: string | null
          recommendation_rate: number
          updated_at: string
          created_by: string | null
          verified: boolean
          verification_date: string | null
          location: string
        }
        Insert: Omit<Tables<'companies'>['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Tables<'companies'>['Row'], 'id'>>
      }
      reviews: {
        Row: {
          id: number
          company_id: number
          user_id: string
          rating: number
          title: string | null
          pros: string | null
          cons: string | null
          position: string | null
          employment_status: EmploymentStatus
          created_at: string
          status: ReviewStatus
          content: string | null
          reviewer_name: string | null
          reviewer_email: string | null
          is_current_employee: boolean
        }
        Insert: Omit<Tables<'reviews'>['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Tables<'reviews'>['Row'], 'id'>>
      }
      user_profiles: {
        Row: {
          id: string
          username: string | null
          email: string | null
          is_verified: boolean
          created_at: string
          role: Role
        }
        Insert: Omit<Tables<'user_profiles'>['Row'], 'created_at' | 'is_verified'>
        Update: Partial<Omit<Tables<'user_profiles'>['Row'], 'id'>>
      }
      review_likes: {
        Row: {
          id: number
          review_id: number
          user_id: string
          created_at: string
          liked: boolean
        }
        Insert: Omit<Tables<'review_likes'>['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Tables<'review_likes'>['Row'], 'id'>>
      }
    }
    Views: Record<string, never>
    Functions: {
      get_company_rating: {
        Args: { company_id_param: number }
        Returns: number
      }
      get_remaining_limits: {
        Args: { user_id: string }
        Returns: {
          remaining_companies: number
          remaining_reviews: number
          reset_in_hours: number
        }
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      employment_status: EmploymentStatus
      review_status: ReviewStatus
      verification_status: VerificationStatus
      rate_limit_type: RateLimitType
    }
  }
}

export type CompanyRow = Tables<'companies'>['Row']
export type ReviewRow = Tables<'reviews'>['Row']
export type UserProfileRow = Tables<'user_profiles'>['Row']
export type ReviewLikeRow = Tables<'review_likes'>['Row'] 