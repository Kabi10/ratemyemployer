// Simplified Database Types for MVP
// This file contains only the essential types needed for the MVP employer review platform

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number
          name: string
          industry: string | null
          location: string | null
          website: string | null
          logo_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          verified: boolean | null
          average_rating: number | null
          total_reviews: number | null
          recommendation_rate: number | null
        }
        Insert: {
          id?: number
          name: string
          industry?: string | null
          location?: string | null
          website?: string | null
          logo_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          verified?: boolean | null
          average_rating?: number | null
          total_reviews?: number | null
          recommendation_rate?: number | null
        }
        Update: {
          id?: number
          name?: string
          industry?: string | null
          location?: string | null
          website?: string | null
          logo_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          verified?: boolean | null
          average_rating?: number | null
          total_reviews?: number | null
          recommendation_rate?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: number
          company_id: number | null
          user_id: string | null
          rating: number | null
          title: string | null
          pros: string | null
          cons: string | null
          content: string | null
          position: string | null
          status: Database["public"]["Enums"]["review_status"] | null
          created_at: string | null
        }
        Insert: {
          id?: number
          company_id?: number | null
          user_id?: string | null
          rating?: number | null
          title?: string | null
          pros?: string | null
          cons?: string | null
          content?: string | null
          position?: string | null
          status?: Database["public"]["Enums"]["review_status"] | null
          created_at?: string | null
        }
        Update: {
          id?: number
          company_id?: number | null
          user_id?: string | null
          rating?: number | null
          title?: string | null
          pros?: string | null
          cons?: string | null
          content?: string | null
          position?: string | null
          status?: Database["public"]["Enums"]["review_status"] | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_company_rating: {
        Args: {
          company_id_param: number
        }
        Returns: number
      }
      get_remaining_limits: {
        Args: {
          user_id: string
        }
        Returns: Json
      }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      safe_division: {
        Args: {
          numerator: number
          denominator: number
        }
        Returns: number
      }
    }
    Enums: {
      rate_limit_type: "review" | "company"
      review_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

// Convenience types for common operations
export type Company = Tables<'companies'>
export type CompanyInsert = TablesInsert<'companies'>
export type CompanyUpdate = TablesUpdate<'companies'>

export type Review = Tables<'reviews'>
export type ReviewInsert = TablesInsert<'reviews'>
export type ReviewUpdate = TablesUpdate<'reviews'>

export type ReviewStatus = Enums<'review_status'>
export type RateLimitType = Enums<'rate_limit_type'>