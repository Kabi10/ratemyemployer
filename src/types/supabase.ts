

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
          id: string
          name: string
          description: string | null
          location: string | null
          industry: string | null
          website: string | null
          created_at: string
          updated_at: string
          rating: number
          review_count: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location?: string | null
          industry?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
          rating?: number
          review_count?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: string | null
          industry?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
          rating?: number
          review_count?: number
        }
      }
      reviews: {
        Row: {
          id: string
          company_id: string
          user_id: string
          rating: number
          title: string
          content: string
          pros: string | null
          cons: string | null
          created_at: string
          updated_at: string
          likes: number
          dislikes: number
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          rating: number
          title: string
          content: string
          pros?: string | null
          cons?: string | null
          created_at?: string
          updated_at?: string
          likes?: number
          dislikes?: number
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          rating?: number
          title?: string
          content?: string
          pros?: string | null
          cons?: string | null
          created_at?: string
          updated_at?: string
          likes?: number
          dislikes?: number
        }
      }
      review_likes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          created_at: string
          is_like: boolean
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          created_at?: string
          is_like: boolean
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          created_at?: string
          is_like?: boolean
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