/**
 * Unified User Session Service
 * Consolidates OAuth authentication and payment subscription management
 * Maintains session continuity across all user flows
 */

import { createClient } from '@/utils/supabase/client'
import { creemService } from '@/services/payment/creem'
import type { OAuthProvider } from '@/modules/auth/oauth/types'

export interface UnifiedUser {
  // Core Identity
  id: string
  email: string
  name?: string
  avatar?: string
  provider: OAuthProvider

  // Subscription State
  subscription: {
    tier: 'free' | 'pro' | 'pro_plus'
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
    customerId?: string
    subscriptionId?: string
    currentPeriodEnd?: Date
    cancelAtPeriodEnd?: boolean
    trialEndsAt?: Date
  }

  // Usage Tracking
  usage: {
    monthly: number
    monthlyLimit: number
    daily: number
    dailyLimit: number
    trialUsage?: number
    trialLimit?: number
    remaining: number
  }

  // Session State
  session: {
    accessToken: string
    refreshToken: string
    expiresAt: number
    isValid: boolean
  }
}

export interface AuthResult {
  success: boolean
  user?: UnifiedUser
  error?: {
    code: string
    message: string
    requiresAuth?: boolean
  }
}

export interface PaymentResult {
  success: boolean
  url?: string
  sessionId?: string
  error?: {
    code: string
    message: string
    requiresAuth?: boolean
  }
}

export interface SubscriptionUpdate {
  type: 'subscription_created' | 'subscription_updated' | 'subscription_canceled' | 'payment_succeeded' | 'payment_failed'
  userId: string
  customerId?: string
  subscriptionId?: string
  tier?: 'pro' | 'pro_plus'
  status?: string
  trialEndsAt?: Date
}

class UserSessionService {
  private static instance: UserSessionService
  private user: UnifiedUser | null = null
  private initialized = false
  private listeners = new Set<(user: UnifiedUser | null) => void>()
  private sessionRefreshTimer: NodeJS.Timeout | null = null
  private supabase = createClient()

  private constructor() {}

  static getInstance(): UserSessionService {
    if (!UserSessionService.instance) {
      UserSessionService.instance = new UserSessionService()
    }
    return UserSessionService.instance
  }

  // ==================== Core Session Management ====================

  async initialize(): Promise<boolean> {
    if (this.initialized) return true

    try {
      console.log('[UserSession] Initializing unified service...')
      
      // Get current session from Supabase
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error) {
        console.error('[UserSession] Error getting session:', error)
        return false
      }

      if (session?.user) {
        // Build unified user with subscription data
        this.user = await this.buildUnifiedUser(session)
        this.startSessionRefreshTimer()
      }

      // Set up auth state listener
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[UserSession] Auth state change:', event)
        
        if (session?.user) {
          this.user = await this.buildUnifiedUser(session)
          this.notifyListeners(this.user)
          
          if (event === 'SIGNED_IN') {
            this.startSessionRefreshTimer()
            // Sync user profile after OAuth sign-in
            await this.syncUserProfile()
          }
        } else {
          this.user = null
          this.stopSessionRefreshTimer()
          this.notifyListeners(null)
        }
      })

      this.initialized = true
      console.log('[UserSession] Initialization complete')
      return true
    } catch (error) {
      console.error('[UserSession] Initialization error:', error)
      return false
    }
  }

  // ==================== Authentication Methods ====================

  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const currentPath = window.location.pathname || '/en'
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`
      
      console.log('[UserSession] Google sign-in initiated:', {
        currentPath,
        origin: window.location.origin,
        hostname: window.location.hostname,
        redirectUrl,
        href: window.location.href,
        isVercelPreview: window.location.hostname.includes('vercel.app'),
        isLocalhost: window.location.hostname === 'localhost'
      })

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        }
      })

      if (error) {
        console.error('[UserSession] OAuth initiation error:', error)
        return {
          success: false,
          error: {
            code: 'OAUTH_SIGNIN_FAILED',
            message: error.message
          }
        }
      }
      
      console.log('[UserSession] OAuth initiated successfully:', {
        authUrl: data?.url,
        provider: 'google'
      })

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'OAUTH_SIGNIN_ERROR',
          message: error.message || 'Unknown error occurred'
        }
      }
    }
  }

  async signOut(): Promise<AuthResult> {
    try {
      console.log('[UserSession] Starting unified sign out...')
      
      // Clear local state immediately
      this.user = null
      this.stopSessionRefreshTimer()
      this.notifyListeners(null)
      
      // Clear storage
      this.clearLocalStorage()
      
      // Sign out from Supabase
      const { error } = await this.supabase.auth.signOut()
      
      if (error) {
        console.error('[UserSession] Sign out error:', error)
        return {
          success: false,
          error: {
            code: 'SIGNOUT_FAILED',
            message: error.message
          }
        }
      }

      console.log('[UserSession] Sign out successful')
      return { success: true }
    } catch (error: any) {
      console.error('[UserSession] Sign out error:', error)
      return {
        success: false,
        error: {
          code: 'SIGNOUT_ERROR',
          message: error.message
        }
      }
    }
  }

  // ==================== Payment Methods ====================

  async createCheckoutSession(planId: 'pro' | 'pro_plus'): Promise<PaymentResult> {
    try {
      console.log('[UserSession] Creating checkout session for plan:', planId)
      
      // Enhanced session validation for payment flows
      const sessionResult = await this.ensureValidSessionForPayment()
      if (!sessionResult.success || !this.user) {
        return {
          success: false,
          error: {
            code: sessionResult.error?.code || 'AUTH_REQUIRED',
            message: sessionResult.error?.message || 'Please sign in to continue',
            requiresAuth: true
          }
        }
      }

      // Check if user already has this tier or higher
      if (this.user.subscription.tier === planId || 
          (planId === 'pro' && this.user.subscription.tier === 'pro_plus')) {
        return {
          success: false,
          error: {
            code: 'ALREADY_SUBSCRIBED',
            message: `You already have ${this.user.subscription.tier} subscription`
          }
        }
      }

      const successUrl = `${window.location.origin}/payment/success?plan=${planId}&user=${this.user.id}`
      const cancelUrl = `${window.location.origin}/payment/cancel?plan=${planId}`

      console.log('[UserSession] Initiating checkout with enhanced session context')
      
      // Use the unified checkout endpoint for better session handling
      const result = await this.callUnifiedCheckoutEndpoint({
        planId,
        successUrl,
        cancelUrl
      })

      if (!result.success) {
        // Handle specific error codes from the API
        const errorCode = this.mapApiErrorCode(result.error)
        return {
          success: false,
          error: {
            code: errorCode,
            message: result.error || 'Failed to create checkout session',
            requiresAuth: errorCode === 'SESSION_EXPIRED' || errorCode === 'AUTH_REQUIRED'
          }
        }
      }

      console.log('[UserSession] Checkout session created successfully')
      return {
        success: true,
        url: result.url,
        sessionId: result.sessionId
      }
    } catch (error: any) {
      console.error('[UserSession] Checkout error:', error)
      
      // Categorize the error for better user experience
      const errorInfo = this.categorizePaymentError(error)
      
      return {
        success: false,
        error: {
          code: errorInfo.code,
          message: errorInfo.message,
          requiresAuth: errorInfo.requiresAuth
        }
      }
    }
  }

  /**
   * Call the unified checkout endpoint with proper session handling
   */
  private async callUnifiedCheckoutEndpoint({ planId, successUrl, cancelUrl }: {
    planId: 'pro' | 'pro_plus'
    successUrl: string
    cancelUrl: string
  }) {
    if (!this.user?.session.accessToken) {
      throw new Error('No valid access token available')
    }

    const response = await fetch('/api/payment/unified-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.user.session.accessToken}`
      },
      body: JSON.stringify({
        planId,
        successUrl,
        cancelUrl
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return await response.json()
  }

  async createPortalSession(): Promise<PaymentResult> {
    try {
      console.log('[UserSession] Creating customer portal session')
      
      // Enhanced session validation for portal access
      const sessionResult = await this.ensureValidSessionForPayment()
      if (!sessionResult.success || !this.user) {
        return {
          success: false,
          error: {
            code: sessionResult.error?.code || 'AUTH_REQUIRED',
            message: 'Please sign in to manage your subscription',
            requiresAuth: true
          }
        }
      }

      // Check if user has any subscription history
      if (this.user.subscription.tier === 'free' && !this.user.subscription.customerId) {
        return {
          success: false,
          error: {
            code: 'NO_SUBSCRIPTION',
            message: 'No subscription found. Please complete a payment first.'
          }
        }
      }

      const returnUrl = `${window.location.origin}/account?portal_return=true`

      console.log('[UserSession] Calling unified portal endpoint')
      
      // Use the unified portal endpoint for better session handling
      const result = await this.callUnifiedPortalEndpoint({ returnUrl })

      if (!result.success) {
        const errorCode = this.mapApiErrorCode(result.error)
        return {
          success: false,
          error: {
            code: errorCode,
            message: result.error || 'Failed to access customer portal',
            requiresAuth: errorCode === 'SESSION_EXPIRED' || errorCode === 'AUTH_REQUIRED'
          }
        }
      }

      console.log('[UserSession] Portal session created successfully')
      return {
        success: true,
        url: result.url
      }
    } catch (error: any) {
      console.error('[UserSession] Portal error:', error)
      
      const errorInfo = this.categorizePaymentError(error)
      
      return {
        success: false,
        error: {
          code: errorInfo.code,
          message: errorInfo.message,
          requiresAuth: errorInfo.requiresAuth
        }
      }
    }
  }

  /**
   * Call the unified portal endpoint with proper session handling
   */
  private async callUnifiedPortalEndpoint({ returnUrl }: { returnUrl: string }) {
    if (!this.user?.session.accessToken) {
      throw new Error('No valid access token available')
    }

    const response = await fetch('/api/payment/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.user.session.accessToken}`
      },
      body: JSON.stringify({
        returnUrl
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return await response.json()
  }

  // ==================== Usage Tracking ====================

  async incrementUsage(): Promise<{ success: boolean; remaining?: number; error?: string }> {
    if (!this.user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { data, error } = await this.supabase.rpc('increment_generation_count', {
        p_user_id: this.user.id,
        p_subscription_tier: this.user.subscription.tier
      })

      if (error) {
        throw error
      }

      // Update local usage state
      if (this.user && data) {
        this.user.usage = {
          monthly: data.monthly_usage || 0,
          monthlyLimit: data.monthly_limit || 0,
          daily: data.daily_usage || 0,
          dailyLimit: data.daily_limit || 0,
          trialUsage: data.trial_usage || undefined,
          trialLimit: data.trial_limit || undefined,
          remaining: data.remaining_daily || 0
        }
        this.notifyListeners(this.user)
      }

      return { success: true, remaining: data.remaining_daily }
    } catch (error: any) {
      console.error('[UserSession] Usage increment error:', error)
      return { success: false, error: error.message }
    }
  }

  async checkUsageLimit(): Promise<{ canGenerate: boolean; remaining: number; limit: number }> {
    if (!this.user) {
      return { canGenerate: false, remaining: 0, limit: 0 }
    }

    try {
      const { data, error } = await this.supabase.rpc('check_generation_limit', {
        p_user_id: this.user.id,
        p_subscription_tier: this.user.subscription.tier
      })

      if (error) {
        console.error('[UserSession] Usage check error:', error)
        return { canGenerate: false, remaining: 0, limit: 0 }
      }

      return {
        canGenerate: data.can_generate || false,
        remaining: data.remaining_daily || 0,
        limit: data.daily_limit || 0
      }
    } catch (error) {
      console.error('[UserSession] Usage check error:', error)
      return { canGenerate: false, remaining: 0, limit: 0 }
    }
  }

  // ==================== Webhook Event Handling ====================

  async handleSubscriptionUpdate(update: SubscriptionUpdate): Promise<void> {
    console.log('[UserSession] Processing subscription update:', update)

    if (!this.user || this.user.id !== update.userId) {
      console.log('[UserSession] Update not for current user, skipping')
      return
    }

    try {
      // Update database first
      await this.updateSubscriptionInDatabase(update)
      
      // Refresh user data
      const session = await this.supabase.auth.getSession()
      if (session.data.session?.user) {
        this.user = await this.buildUnifiedUser(session.data.session)
        this.notifyListeners(this.user)
      }

      console.log('[UserSession] Subscription update processed successfully')
    } catch (error) {
      console.error('[UserSession] Error processing subscription update:', error)
    }
  }

  // ==================== Getters ====================

  getCurrentUser(): UnifiedUser | null {
    return this.user
  }

  isAuthenticated(): boolean {
    return !!this.user
  }

  hasValidSubscription(): boolean {
    return this.user?.subscription.tier !== 'free' && 
           this.user?.subscription.status === 'active'
  }

  isTrialing(): boolean {
    return this.user?.subscription.status === 'trialing'
  }

  // ==================== Event Listeners ====================

  subscribe(callback: (user: UnifiedUser | null) => void): () => void {
    this.listeners.add(callback)
    // Immediately call with current user
    callback(this.user)
    
    return () => {
      this.listeners.delete(callback)
    }
  }

  private notifyListeners(user: UnifiedUser | null): void {
    this.listeners.forEach(callback => {
      try {
        callback(user)
      } catch (error) {
        console.error('[UserSession] Error in listener callback:', error)
      }
    })
  }

  // ==================== Private Helper Methods ====================

  private async buildUnifiedUser(session: any): Promise<UnifiedUser> {
    const { user } = session
    
    // Get subscription data
    const subscription = await this.getSubscriptionData(user.id)
    const usage = await this.getUsageData(user.id, subscription.tier)

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
      avatar: user.user_metadata?.avatar_url,
      provider: (user.app_metadata?.provider as OAuthProvider) || 'google',
      subscription,
      usage,
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at,
        isValid: this.isSessionValid(session)
      }
    }
  }

  private async getSubscriptionData(userId: string) {
    try {
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('[UserSession] Error fetching subscription:', error)
      }

      // Get trial info from auth.users
      const { data: userTrialData } = await this.supabase
        .from('auth.users')
        .select('creem_trial_ends_at, creem_subscription_tier')
        .eq('id', userId)
        .single()

      const isTrialing = userTrialData?.creem_trial_ends_at && 
                        new Date(userTrialData.creem_trial_ends_at) > new Date()

      return {
        tier: (subscription?.subscription_tier || userTrialData?.creem_subscription_tier || 'free') as 'free' | 'pro' | 'pro_plus',
        status: isTrialing ? 'trialing' : (subscription?.status || 'active') as any,
        customerId: subscription?.stripe_customer_id,
        subscriptionId: subscription?.stripe_subscription_id,
        currentPeriodEnd: subscription?.current_period_end ? new Date(subscription.current_period_end) : undefined,
        cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
        trialEndsAt: userTrialData?.creem_trial_ends_at ? new Date(userTrialData.creem_trial_ends_at) : undefined
      }
    } catch (error) {
      console.error('[UserSession] Error building subscription data:', error)
      return {
        tier: 'free' as const,
        status: 'active' as const,
        customerId: undefined,
        subscriptionId: undefined,
        currentPeriodEnd: undefined,
        cancelAtPeriodEnd: false,
        trialEndsAt: undefined
      }
    }
  }

  private async getUsageData(userId: string, tier: string) {
    try {
      const { data, error } = await this.supabase.rpc('check_generation_limit', {
        p_user_id: userId,
        p_subscription_tier: tier
      })

      if (error) {
        console.error('[UserSession] Error fetching usage data:', error)
        return {
          monthly: 0,
          monthlyLimit: tier === 'free' ? 10 : (tier === 'pro' ? 120 : 300),
          daily: 0,
          dailyLimit: tier === 'free' ? 3 : 10,
          remaining: tier === 'free' ? 3 : 10
        }
      }

      return {
        monthly: data.monthly_usage || 0,
        monthlyLimit: data.monthly_limit || 0,
        daily: data.daily_usage || 0,
        dailyLimit: data.daily_limit || 0,
        trialUsage: data.trial_usage || undefined,
        trialLimit: data.trial_limit || undefined,
        remaining: data.remaining_daily || 0
      }
    } catch (error) {
      console.error('[UserSession] Error building usage data:', error)
      return {
        monthly: 0,
        monthlyLimit: 10,
        daily: 0,
        dailyLimit: 3,
        remaining: 3
      }
    }
  }

  private async ensureValidSession(): Promise<AuthResult> {
    if (!this.user) {
      return {
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Not authenticated',
          requiresAuth: true
        }
      }
    }

    // Check if session needs refresh
    if (this.isSessionExpiringSoon()) {
      const refreshResult = await this.refreshSession()
      if (!refreshResult.success) {
        return refreshResult
      }
    }

    return { success: true, user: this.user }
  }

  /**
   * Enhanced session validation specifically for payment flows
   * Includes stricter expiry checks and session quality validation
   */
  private async ensureValidSessionForPayment(): Promise<AuthResult> {
    if (!this.user) {
      return {
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required for payment',
          requiresAuth: true
        }
      }
    }

    // More strict expiry check for payment flows (10 minutes buffer)
    if (this.isSessionExpiringSoon(10)) {
      console.log('[UserSession] Session expiring soon, refreshing for payment flow')
      const refreshResult = await this.refreshSession()
      if (!refreshResult.success) {
        return {
          success: false,
          error: {
            code: 'SESSION_REFRESH_REQUIRED',
            message: 'Session expired, please sign in again',
            requiresAuth: true
          }
        }
      }
    }

    // Validate session quality (access token exists and is properly formatted)
    if (!this.user.session.accessToken || this.user.session.accessToken.length < 50) {
      console.error('[UserSession] Invalid access token format')
      return {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Session token invalid, please sign in again',
          requiresAuth: true
        }
      }
    }

    console.log('[UserSession] Session validation successful for payment flow')
    return { success: true, user: this.user }
  }

  /**
   * Map API error responses to user-friendly error codes
   */
  private mapApiErrorCode(errorMessage?: string): string {
    if (!errorMessage) return 'UNKNOWN_ERROR'
    
    const message = errorMessage.toLowerCase()
    
    if (message.includes('session_invalid') || message.includes('invalid session')) {
      return 'SESSION_EXPIRED'
    }
    if (message.includes('session_expiring') || message.includes('expires soon')) {
      return 'SESSION_REFRESH_REQUIRED'
    }
    if (message.includes('auth_required') || message.includes('authorization')) {
      return 'AUTH_REQUIRED'
    }
    if (message.includes('checkout_failed') || message.includes('checkout')) {
      return 'CHECKOUT_FAILED'
    }
    if (message.includes('payment_service_error')) {
      return 'PAYMENT_SERVICE_ERROR'
    }
    
    return 'CHECKOUT_ERROR'
  }

  /**
   * Categorize payment errors for better user experience
   */
  private categorizePaymentError(error: any): { code: string; message: string; requiresAuth: boolean } {
    const message = error.message?.toLowerCase() || ''
    
    if (message.includes('authentication') || message.includes('unauthorized') || message.includes('token')) {
      return {
        code: 'AUTH_ERROR',
        message: 'Authentication expired. Please sign in again.',
        requiresAuth: true
      }
    }
    
    if (message.includes('network') || message.includes('fetch failed')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Connection error. Please check your internet connection.',
        requiresAuth: false
      }
    }
    
    if (message.includes('already_subscribed')) {
      return {
        code: 'ALREADY_SUBSCRIBED',
        message: 'You already have this subscription tier.',
        requiresAuth: false
      }
    }
    
    return {
      code: 'PAYMENT_ERROR',
      message: 'Payment processing failed. Please try again.',
      requiresAuth: false
    }
  }

  private async refreshSession(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()
      
      if (error || !data.session) {
        // Session invalid, clear user
        this.user = null
        this.notifyListeners(null)
        return {
          success: false,
          error: {
            code: 'SESSION_EXPIRED',
            message: 'Session expired, please sign in again',
            requiresAuth: true
          }
        }
      }

      // Update user with new session
      this.user = await this.buildUnifiedUser(data.session)
      this.notifyListeners(this.user)

      return { success: true, user: this.user }
    } catch (error: any) {
      console.error('[UserSession] Refresh session error:', error)
      return {
        success: false,
        error: {
          code: 'SESSION_REFRESH_ERROR',
          message: error.message || 'Failed to refresh session'
        }
      }
    }
  }

  private isSessionValid(session: any): boolean {
    if (!session?.expires_at) return false
    const expiresAt = new Date(session.expires_at * 1000)
    return new Date() < expiresAt
  }

  private isSessionExpiringSoon(bufferMinutes: number = 5): boolean {
    if (!this.user?.session.expiresAt) return true
    
    const expiresAt = new Date(this.user.session.expiresAt * 1000)
    const now = new Date()
    const timeUntilExpiry = expiresAt.getTime() - now.getTime()
    const bufferMs = bufferMinutes * 60 * 1000
    
    return timeUntilExpiry <= bufferMs
  }

  private startSessionRefreshTimer(): void {
    this.stopSessionRefreshTimer()
    
    // Check every minute
    this.sessionRefreshTimer = setInterval(async () => {
      if (this.user && this.isSessionExpiringSoon()) {
        await this.refreshSession()
      }
    }, 60 * 1000)
  }

  private stopSessionRefreshTimer(): void {
    if (this.sessionRefreshTimer) {
      clearInterval(this.sessionRefreshTimer)
      this.sessionRefreshTimer = null
    }
  }

  private async syncUserProfile(): Promise<void> {
    if (!this.user) return

    try {
      await this.supabase
        .from('profiles')
        .upsert({
          id: this.user.id,
          email: this.user.email,
          full_name: this.user.name || '',
          avatar_url: this.user.avatar || '',
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
    } catch (error) {
      console.error('[UserSession] Error syncing user profile:', error)
    }
  }

  private clearLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase') || key === 'coverimage_session') {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('[UserSession] Error clearing localStorage:', error)
    }
  }

  private async updateSubscriptionInDatabase(update: SubscriptionUpdate): Promise<void> {
    try {
      switch (update.type) {
        case 'subscription_created':
        case 'subscription_updated':
          if (update.customerId && update.subscriptionId) {
            await this.supabase
              .from('subscriptions')
              .upsert({
                user_id: update.userId,
                stripe_customer_id: update.customerId,
                stripe_subscription_id: update.subscriptionId,
                subscription_tier: update.tier || 'pro',
                status: update.status || 'active',
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' })
          }
          
          // Update trial status if applicable
          if (update.trialEndsAt) {
            await this.supabase.rpc('update_user_trial_status', {
              p_user_id: update.userId,
              p_trial_ends_at: update.trialEndsAt.toISOString(),
              p_subscription_tier: update.tier
            })
          }
          break

        case 'subscription_canceled':
          await this.supabase
            .from('subscriptions')
            .update({ 
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', update.userId)
          break
      }
    } catch (error) {
      console.error('[UserSession] Database update error:', error)
      throw error
    }
  }

  destroy(): void {
    this.stopSessionRefreshTimer()
    this.listeners.clear()
    this.initialized = false
    this.user = null
    UserSessionService.instance = null as any
  }
}

export const userSessionService = UserSessionService.getInstance()