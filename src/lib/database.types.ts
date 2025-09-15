// Basic database types for the application
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'free' | 'pro' | 'pro_plus'
          status: 'active' | 'trialing' | 'paused' | 'cancelled'
          stripe_subscription_id?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier: 'free' | 'pro' | 'pro_plus'
          status: 'active' | 'trialing' | 'paused' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: 'free' | 'pro' | 'pro_plus'
          status?: 'active' | 'trialing' | 'paused' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      user_usage: {
        Row: {
          id: string
          user_id: string
          date: string
          generation_count: number
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          generation_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          generation_count?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_user_usage: {
        Args: {
          p_user_id: string
          p_date: string
        }
        Returns: void
      }
      get_daily_generation_count: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}