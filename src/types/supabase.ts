// Manual type definitions for Supabase tables
// In production, these should be generated using `supabase gen types`

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
      feedback: {
        Row: {
          id: string
          user_id: string | null
          email: string | null
          name: string | null
          message: string
          type: 'bug' | 'feature' | 'improvement' | 'other'
          rating: number | null
          page_url: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email?: string | null
          name?: string | null
          message: string
          type?: 'bug' | 'feature' | 'improvement' | 'other'
          rating?: number | null
          page_url?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string | null
          name?: string | null
          message?: string
          type?: 'bug' | 'feature' | 'improvement' | 'other'
          rating?: number | null
          page_url?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'free' | 'pro' | 'pro_plus'
          status: 'active' | 'cancelled' | 'past_due'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_start: string | null
          trial_end: string | null
          is_trial_active: boolean
          converted_from_trial: boolean
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier?: 'free' | 'pro' | 'pro_plus'
          status?: 'active' | 'cancelled' | 'past_due'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_start?: string | null
          trial_end?: string | null
          is_trial_active?: boolean
          converted_from_trial?: boolean
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: 'free' | 'pro' | 'pro_plus'
          status?: 'active' | 'cancelled' | 'past_due'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_start?: string | null
          trial_end?: string | null
          is_trial_active?: boolean
          converted_from_trial?: boolean
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_mapping: {
        Row: {
          id: string
          user_id: string
          provider: 'stripe' | 'creem'
          customer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'stripe' | 'creem'
          customer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'stripe' | 'creem'
          customer_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}