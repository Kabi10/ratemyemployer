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
          average_rating: number | null
          benefits: string | null
          ceo: string | null
          company_values: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: number
          industry: string | null
          location: string
          logo_url: string | null
          name: string
          recommendation_rate: number | null
          total_reviews: number | null
          updated_at: string | null
          verification_date: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
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
          id?: number
          industry?: string | null
          location?: string
          logo_url?: string | null
          name: string
          recommendation_rate?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          verification_date?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
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
          id?: number
          industry?: string | null
          location?: string
          logo_url?: string | null
          name?: string
          recommendation_rate?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          verification_date?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          company_id: number | null
          cons: string | null
          content: string | null
          created_at: string | null
          employment_status: string | null
          id: number
          is_current_employee: boolean | null
          position: string | null
          pros: string | null
          rating: number | null
          reviewer_email: string | null
          reviewer_name: string | null
          status: Database["public"]["Enums"]["review_status"] | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: number | null
          cons?: string | null
          content?: string | null
          created_at?: string | null
          employment_status?: string | null
          id?: number
          is_current_employee?: boolean | null
          position?: string | null
          pros?: string | null
          rating?: number | null
          reviewer_email?: string | null
          reviewer_name?: string | null
          status?: Database["public"]["Enums"]["review_status"] | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: number | null
          cons?: string | null
          content?: string | null
          created_at?: string | null
          employment_status?: string | null
          id?: number
          is_current_employee?: boolean | null
          position?: string | null
          pros?: string | null
          rating?: number | null
          reviewer_email?: string | null
          reviewer_name?: string | null
          status?: Database["public"]["Enums"]["review_status"] | null
          title?: string | null
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
          created_at: string
          email: string | null
          id: string
          is_verified: boolean | null
          role: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_verified?: boolean | null
          role?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean | null
          role?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit:
        | {
            Args: {
              user_id: string
              limit_type: Database["public"]["Enums"]["rate_limit_type"]
              company_id?: number
            }
            Returns: boolean
          }
        | {
            Args: {
              user_id: string
              limit_type: Database["public"]["Enums"]["rate_limit_type"]
              company_id?: number
            }
            Returns: boolean
          }
      check_trigger_and_function_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          trigger_name: string
          trigger_table: string
          trigger_event: string
          function_name: string
          function_status: string
          error_message: string
        }[]
      }
      cleanup_triggers_and_functions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
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
      list_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          role: string
          created_at: string
        }[]
      }
      safe_division: {
        Args: {
          numerator: number
          denominator: number
        }
        Returns: number
      }
      update_user_role: {
        Args: {
          target_user_id: string
          new_role: string
          admin_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      employment_status: "Full-time" | "Part-time" | "Contract" | "Intern"
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
