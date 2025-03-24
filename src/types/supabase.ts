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
      admins: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          average_rating: number | null
          benefits: string | null
          ceo: string | null
          company_values: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: number
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string
          recommendation_rate: number | null
          size: string | null
          total_reviews: number | null
          updated_at: string | null
          verification_date: string | null
          verification_status: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          average_rating?: number | null
          benefits?: string | null
          ceo?: string | null
          company_values?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: never
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          recommendation_rate?: number | null
          size?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          verification_date?: string | null
          verification_status?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          average_rating?: number | null
          benefits?: string | null
          ceo?: string | null
          company_values?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: never
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          recommendation_rate?: number | null
          size?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          verification_date?: string | null
          verification_status?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      company_news: {
        Row: {
          cached_at: string | null
          company_name: string
          description: string | null
          id: string
          published_at: string | null
          relevance_score: number | null
          source: string | null
          title: string
          url: string | null
        }
        Insert: {
          cached_at?: string | null
          company_name: string
          description?: string | null
          id?: string
          published_at?: string | null
          relevance_score?: number | null
          source?: string | null
          title: string
          url?: string | null
        }
        Update: {
          cached_at?: string | null
          company_name?: string
          description?: string | null
          id?: string
          published_at?: string | null
          relevance_score?: number | null
          source?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      moderation_history: {
        Row: {
          action: string
          created_at: string
          entity_id: number
          entity_type: string
          id: string
          moderator_id: string | null
          new_status: string
          notes: string | null
          previous_status: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: number
          entity_type: string
          id?: string
          moderator_id?: string | null
          new_status: string
          notes?: string | null
          previous_status?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: number
          entity_type?: string
          id?: string
          moderator_id?: string | null
          new_status?: string
          notes?: string | null
          previous_status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          company_id: number | null
          cons: string
          created_at: string | null
          employment_status: string | null
          id: number
          is_current_employee: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          position: string | null
          pros: string
          rating: number | null
          reviewer_email: string | null
          reviewer_id: string | null
          reviewer_name: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: number | null
          cons: string
          created_at?: string | null
          employment_status?: string | null
          id?: never
          is_current_employee?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          position?: string | null
          pros: string
          rating?: number | null
          reviewer_email?: string | null
          reviewer_id?: string | null
          reviewer_name?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: number | null
          cons?: string
          created_at?: string | null
          employment_status?: string | null
          id?: never
          is_current_employee?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          position?: string | null
          pros?: string
          rating?: number | null
          reviewer_email?: string | null
          reviewer_id?: string | null
          reviewer_name?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      review_moderation_stats: {
        Row: {
          actions_taken: string | null
          last_moderation: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_count: number | null
          moderator_email: string | null
          review_id: number | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_industry_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          industry: string
          average_rating: number
          company_count: number
          review_count: number
        }[]
      }
      get_location_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          location: string
          average_rating: number
          company_count: number
          review_count: number
        }[]
      }
      get_size_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: string
          average_rating: number
          company_count: number
          review_count: number
        }[]
      }
      is_valid_url: {
        Args: {
          url: string
        }
        Returns: boolean
      }
      log_error: {
        Args: {
          operation: string
          table_name: string
          error_message: string
          details?: Json
        }
        Returns: undefined
      }
      normalize_company_name: {
        Args: {
          name: string
        }
        Returns: string
      }
      normalize_industry: {
        Args: {
          industry: string
        }
        Returns: string
      }
    }
    Enums: {
      company_industry:
        | "Technology"
        | "Healthcare"
        | "Education"
        | "Finance"
        | "Manufacturing"
        | "Retail"
        | "Other"
      company_verification_status: "pending" | "verified" | "rejected"
      rate_limit_type: "review" | "company"
      review_status: "pending" | "approved" | "rejected"
      verification_status: "pending" | "verified" | "rejected"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
