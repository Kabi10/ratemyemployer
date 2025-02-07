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
          created_at: string
          created_by: string | null
          description: string | null
          id: number
          industry: Database["public"]["Enums"]["company_industry"] | null
          location: string | null
          logo_url: string | null
          metadata: Json | null
          name: string
          total_reviews: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: number
          industry?: Database["public"]["Enums"]["company_industry"] | null
          location?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          total_reviews?: number | null
          updated_at: string
          website?: string | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: number
          industry?: Database["public"]["Enums"]["company_industry"] | null
          location?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          total_reviews?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          company_id: number
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
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id: number
          cons?: string | null
          content?: string | null
          created_at?: string | null
          employment_status?: string | null
          id?: never
          is_current_employee?: boolean | null
          position?: string | null
          pros?: string | null
          rating?: number | null
          reviewer_email?: string | null
          reviewer_name?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: number
          cons?: string | null
          content?: string | null
          created_at?: string | null
          employment_status?: string | null
          id?: never
          is_current_employee?: boolean | null
          position?: string | null
          pros?: string | null
          rating?: number | null
          reviewer_email?: string | null
          reviewer_name?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
