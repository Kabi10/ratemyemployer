export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number
          name: string
          industry: string
          website: string | null
          logo_url: string | null
          created_at: string
          benefits: string | null
          company_values: string | null
          ceo: string | null
          verification_status: string
          average_rating: number
          total_reviews: number
          location: string
          size: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          industry: string
          website?: string | null
          logo_url?: string | null
          created_at?: string
          benefits?: string | null
          company_values?: string | null
          ceo?: string | null
          verification_status?: string
          average_rating?: number
          total_reviews?: number
          location: string
          size?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          industry?: string
          website?: string | null
          logo_url?: string | null
          created_at?: string
          benefits?: string | null
          company_values?: string | null
          ceo?: string | null
          verification_status?: string
          average_rating?: number
          total_reviews?: number
          location?: string
          size?: string | null
          updated_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: number
          company_id: number
          user_id: string | null
          rating: number
          title: string
          content: string | null
          pros: string
          cons: string
          position: string
          employment_status: string
          created_at: string
          status: string
          reviewer_name: string | null
          reviewer_email: string | null
          is_current_employee: boolean
        }
        Insert: {
          id?: number
          company_id: number
          user_id?: string | null
          rating: number
          title: string
          content?: string | null
          pros: string
          cons: string
          position: string
          employment_status: string
          created_at?: string
          status?: string
          reviewer_name?: string | null
          reviewer_email?: string | null
          is_current_employee?: boolean
        }
        Update: {
          id?: number
          company_id?: number
          user_id?: string | null
          rating?: number
          title?: string
          content?: string | null
          pros?: string
          cons?: string
          position?: string
          employment_status?: string
          created_at?: string
          status?: string
          reviewer_name?: string | null
          reviewer_email?: string | null
          is_current_employee?: boolean
        }
      }
      review_likes: {
        Row: {
          id: number
          review_id: number
          user_id: string
          created_at: string
        }
        Insert: {
          id?: number
          review_id: number
          user_id: string
          created_at?: string
        }
        Update: {
          id?: number
          review_id?: number
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      employment_status: 'Full-time' | 'Part-time' | 'Contract' | 'Intern' | 'Former'
      review_status: 'pending' | 'approved' | 'rejected'
      verification_status: 'pending' | 'verified' | 'rejected'
    }
  }
  auth: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          role?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 