export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'admin' | 'user';

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          industry: string;
          description: string | null;
          location: string;
          website: string | null;
          ceo: string | null;
          average_rating: number;
          total_reviews: number;
          recommendation_rate: number;
          created_at: string;
          updated_at: string;
          verified: boolean;
          verification_date: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          industry: string;
          description?: string | null;
          location: string;
          website?: string | null;
          ceo?: string | null;
          average_rating?: number;
          total_reviews?: number;
          recommendation_rate?: number;
          created_at?: string;
          updated_at?: string;
          verified?: boolean;
          verification_date?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          industry?: string;
          description?: string | null;
          location?: string;
          website?: string | null;
          ceo?: string | null;
          average_rating?: number;
          total_reviews?: number;
          recommendation_rate?: number;
          created_at?: string;
          updated_at?: string;
          verified?: boolean;
          verification_date?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          rating: number;
          title: string;
          content: string;
          pros: string | null;
          cons: string | null;
          status: string;
          position: string;
          employment_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          rating: number;
          title: string;
          content: string;
          pros?: string | null;
          cons?: string | null;
          status?: string;
          position: string;
          employment_status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string;
          rating?: number;
          title?: string;
          content?: string;
          pros?: string | null;
          cons?: string | null;
          status?: string;
          position?: string;
          employment_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      review_likes: {
        Row: {
          id: string;
          review_id: string;
          user_id: string;
          liked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          user_id: string;
          liked: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          user_id?: string;
          liked?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'review_likes_review_id_fkey';
            columns: ['review_id'];
            isOneToOne: false;
            referencedRelation: 'reviews';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'review_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_role: {
        Args: {
          user_id: string;
        };
        Returns: string;
      };
      list_users: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          email: string;
          role: UserRole;
          created_at: string;
        }[];
      };
      update_user_role: {
        Args: {
          target_user_id: string;
          new_role: UserRole;
        };
        Returns: void;
      };
      get_admin_stats: {
        Args: Record<string, never>;
        Returns: {
          totalCompanies: number;
          totalReviews: number;
          totalUsers: number;
          pendingReviews: number;
        };
      };
      create_user_role_type: {
        Args: Record<string, never>;
        Returns: void;
      };
      add_role_column: {
        Args: Record<string, never>;
        Returns: void;
      };
      set_initial_admin: {
        Args: {
          admin_email: string;
        };
        Returns: void;
      };
      exec_sql: {
        Args: {
          sql: string;
        };
        Returns: void;
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
          role: UserRole;
        };
        Insert: {
          id?: string;
          email: string;
          role?: UserRole;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
        };
      };
    };
  };
}
