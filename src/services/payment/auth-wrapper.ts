import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

interface AuthContext {
  isAuthenticated: boolean
  userId: string | null
  userEmail: string | null
}

export class PaymentAuthWrapper {
  static async getAuthContext(): Promise<AuthContext> {
    try {
      const supabase = createClient()
      
      // Get the current user
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return {
          isAuthenticated: false,
          userId: null,
          userEmail: null
        }
      }
      
      return {
        isAuthenticated: true,
        userId: user.id,
        userEmail: user.email || null
      }
    } catch (error) {
      console.error('[PaymentAuthWrapper] Error getting auth context:', error)
      return {
        isAuthenticated: false,
        userId: null,
        userEmail: null
      }
    }
  }
  
  static async requireAuth(): Promise<{ userId: string; userEmail: string }> {
    const context = await this.getAuthContext()
    
    if (!context.isAuthenticated || !context.userId) {
      throw new Error('Authentication required')
    }
    
    return {
      userId: context.userId,
      userEmail: context.userEmail || ''
    }
  }
}