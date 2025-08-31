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