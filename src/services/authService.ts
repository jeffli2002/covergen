import { supabase } from '@/lib/supabase-simple'

let authServiceInstance: AuthService | null = null

class AuthService {
  private user: any = null
  private session: any = null
  private initialized = false
  private authSubscription: any = null
  private onAuthChange: ((user: any) => void) | null = null
  private initPromise: Promise<boolean> | null = null
  private sessionRefreshInterval: NodeJS.Timeout | null = null
  private sessionRefreshInProgress = false
  private lastSessionCheck: number | null = null
  constructor() {
    if (authServiceInstance) {
      return authServiceInstance
    }
    authServiceInstance = this
  }

  private getSupabase() {
    // Use the singleton simple client to avoid multiple instances
    return supabase
  }

  async initialize() {
    if (this.initialized) {
      return true
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this._doInitialize()
    return this.initPromise
  }

  private async _doInitialize() {
    try {
      console.log('[Auth] Starting simplified initialization...')
      
      const supabase = this.getSupabase()
      if (!supabase) {
        console.warn('[Auth] Supabase not configured, auth service will be disabled')
        this.initialized = true
        return false
      }

      // Simple session check - let Supabase handle the complexity
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('[Auth] Initial session check:', { 
        hasSession: !!session,
        hasError: !!error,
        user: session?.user?.email,
        error: error?.message 
      })

      if (error) {
        console.error('[Auth] Error getting initial session:', error)
      } else if (session) {
        this.session = session
        this.user = session.user
        this.storeSession(session)
        
        // Notify auth change handler
        if (this.onAuthChange) {
          this.onAuthChange(this.user)
        }
      }

      this.initialized = true

      // Set up auth state change listener
      if (!this.authSubscription) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
          console.log('[Auth] Auth state change:', { event, user: session?.user?.email })
          
          this.session = session
          this.user = session?.user || null
          this.lastSessionCheck = Date.now()

          if (session) {
            this.storeSession(session)
          } else {
            this.clearStoredSession()
          }

          if (this.onAuthChange) {
            this.onAuthChange(this.user)
          }
          
          if (event === 'SIGNED_IN' && session) {
            await this.onSignIn(session.user)
            this.startSessionRefreshTimer()
          } else if (event === 'SIGNED_OUT') {
            this.stopSessionRefreshTimer()
          } else if (event === 'TOKEN_REFRESHED') {
            this.lastSessionCheck = Date.now()
            if (session) {
              this.storeSession(session)
            }
          } else if (event === 'USER_UPDATED') {
            await this.syncUserData()
          }
        })
        this.authSubscription = subscription
      }

      if (this.user) {
        this.startSessionRefreshTimer()
      }

      return true
    } catch (error) {
      console.error('Error initializing auth:', error)
      return false
    }
  }

  async signUp(email: string, password: string, metadata: any = {}) {
    const maxRetries = 3
    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const supabaseClient = this.getSupabase()
        if (!supabaseClient) {
          throw new Error('Supabase not initialized')
        }
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: metadata.fullName || '',
              role: metadata.role || 'user',
              avatar_url: metadata.avatarUrl || ''
            }
          }
        })

        if (error) {
          if (error.message?.includes('already registered') || 
              error.message?.includes('invalid') ||
              error.message?.includes('weak password')) {
            throw error
          }
          lastError = error
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            continue
          }
          throw error
        }

        return {
          success: true,
          user: data.user,
          session: data.session,
          message: 'Account created successfully! Please check your email to verify your account.'
        }
      } catch (error: any) {
        if (attempt === maxRetries) {
          return {
            success: false,
            error: error.message || lastError?.message || 'Failed to create account'
          }
        }
      }
    }

    return { success: false, error: 'Failed to create account' }
  }

  async signIn(email: string, password: string) {
    const maxRetries = 3
    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const supabaseClient = this.getSupabase()
        if (!supabaseClient) {
          throw new Error('Supabase not initialized')
        }
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          if (error.message?.includes('Invalid login credentials') || 
              error.message?.includes('Email not confirmed')) {
            throw error
          }
          lastError = error
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            continue
          }
          throw error
        }

        if (data.session) {
          this.storeSession(data.session)
        }
        this.startSessionRefreshTimer()

        return {
          success: true,
          user: data.user,
          session: data.session
        }
      } catch (error: any) {
        if (attempt === maxRetries) {
          return {
            success: false,
            error: error.message || lastError?.message || 'Failed to sign in'
          }
        }
      }
    }

    return { success: false, error: 'Failed to sign in' }
  }

  async signInWithGoogle() {
    try {
      const supabase = this.getSupabase()
      if (!supabase) {
        throw new Error('Supabase not configured')
      }

      // Get the current pathname to preserve locale
      const currentPath = window.location.pathname || '/en'
      
      // Always use the standard callback route - it works on all deployments
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`

      console.log('[Auth] Google sign in with redirect URL:', redirectUrl)

      const { data, error } = await supabase.auth.signInWithOAuth({
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
        throw error
      }

      return {
        success: true,
        data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async signOut() {
    try {
      console.log('[Auth] Starting sign out process')
      
      // Stop session refresh timer first
      this.stopSessionRefreshTimer()
      
      // Clear local state immediately
      this.user = null
      this.session = null
      this.clearStoredSession()
      
      // Notify listeners immediately for instant UI update
      if (this.onAuthChange) {
        this.onAuthChange(null)
      }
      
      // Clear all auth-related localStorage items
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase') || key === 'coverimage_session') {
            console.log('[Auth] Removing localStorage key:', key)
            localStorage.removeItem(key)
          }
        })
      } catch (e) {
        console.error('[Auth] Error clearing localStorage:', e)
      }
      
      // Then call Supabase signOut
      const supabaseClient = this.getSupabase()
      if (supabaseClient) {
        const { error } = await supabaseClient.auth.signOut()
        if (error) {
          console.error('[Auth] Sign out error:', error)
          throw error
        }
      }

      console.log('[Auth] Sign out successful')
      return {
        success: true
      }
    } catch (error: any) {
      console.error('[Auth] Sign out failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async resetPassword(email: string) {
    try {
      const supabaseClient = this.getSupabase()
      if (!supabaseClient) {
        throw new Error('Supabase not initialized')
      }
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const supabaseClient = this.getSupabase()
      if (!supabaseClient) {
        throw new Error('Supabase not initialized')
      }
      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Password updated successfully!'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  getCurrentUser() {
    return this.user
  }

  getCurrentSession() {
    if (this.session) {
      console.log('[Auth] getCurrentSession called, session details:', {
        hasSession: true,
        userId: this.session.user?.id,
        email: this.session.user?.email,
        expires_at: this.session.expires_at,
        expires_in: this.session.expires_in,
        hasAccessToken: !!this.session.access_token,
        hasRefreshToken: !!this.session.refresh_token
      })
    } else {
      console.log('[Auth] getCurrentSession called, no session')
    }
    return this.session
  }

  getSupabaseClient() {
    return this.getSupabase()
  }

  async ensureValidSession() {
    try {
      // Check if we have a session and it's still valid
      if (this.session && this.isSessionValid(this.session)) {
        return { success: true, session: this.session }
      }

      // Try to refresh the session
      const { session, error } = await this.refreshSession()
      
      if (error || !session) {
        console.error('[Auth] Failed to ensure valid session:', error)
        return { success: false, error: (error as any)?.message || 'No valid session' }
      }

      return { success: true, session }
    } catch (error: any) {
      console.error('[Auth] Error ensuring valid session:', error)
      return { success: false, error: error.message || 'Failed to ensure valid session' }
    }
  }

  // Deprecated - PKCE flow doesn't use this method
  async setOAuthSession(accessToken: string, refreshToken: string) {
    console.warn('[AuthService] setOAuthSession is deprecated for PKCE flow')
    return { success: false, error: 'This method is not used in PKCE flow' }
  }

  async exchangeCodeForSession(code: string) {
    try {
      const supabaseClient = this.getSupabase()
      if (!supabaseClient) {
        throw new Error('Supabase not configured')
      }

      console.log('[AuthService] Exchanging OAuth code for session...')
      
      const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[AuthService] Error exchanging code:', error)
        return { success: false, error: error.message }
      }
      
      console.log('[AuthService] Code exchange successful')
      
      // Session will be handled by onAuthStateChange listener
      return { success: true, data }
    } catch (error: any) {
      console.error('[AuthService] Failed to exchange code:', error)
      return { success: false, error: error.message }
    }
  }

  async waitForAuth() {
    if (!this.initialized) {
      await this.initialize()
    }

    if (!this.user) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return this.user
  }

  isAuthenticated() {
    return !!this.user
  }

  async getUserUsageToday() {
    if (!this.user) {
      // No user, return 0 without logging error
      return 0
    }

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const supabaseClient = this.getSupabase()
      if (!supabaseClient) {
        return 0
      }
      const { data, error } = await supabaseClient
        .from('user_usage')
        .select('generation_count')
        .eq('user_id', this.user.id)
        .gte('date', today.toISOString())
        .single()

      if (error && error.code !== 'PGRST116' && error.code !== '42703') {
        // PGRST116: no rows found, 42703: column does not exist
        throw error
      }

      return data?.generation_count || 0
    } catch (error) {
      console.error('Error getting user usage:', error)
      return 0
    }
  }

  async incrementUsage() {
    if (!this.user) return { success: false, error: 'Not authenticated' }

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const supabaseClient = this.getSupabase()
      if (!supabaseClient) {
        throw new Error('Supabase not initialized')
      }
      const { error } = await supabaseClient.rpc('increment_user_usage', {
        p_user_id: this.user.id,
        p_date: today.toISOString()
      })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error incrementing usage:', error)
      return { success: false, error: error.message }
    }
  }

  async getUserSubscription() {
    if (!this.user) return null

    try {
      const supabaseClient = this.getSupabase()
      if (!supabaseClient) {
        return null
      }
      const { data, error } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', this.user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error getting subscription:', error)
      return null
    }
  }

  setAuthChangeHandler(handler: (user: any) => void) {
    this.onAuthChange = handler
  }

  private async onSignIn(user: any) {
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const supabaseClient = this.getSupabase()
        if (!supabaseClient) {
          console.error('Supabase not initialized')
          continue
        }
        const { error: upsertError } = await supabaseClient
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })

        if (upsertError) {
          console.error(`Profile upsert attempt ${attempt} failed:`, upsertError)
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            continue
          }
        }
        break
      } catch (error) {
        console.error(`Error upserting profile (attempt ${attempt}):`, error)
      }
    }
  }

  private onSignOut() {
    this.user = null
    this.session = null
    this.clearStoredSession()
    
    if (this.onAuthChange) {
      this.onAuthChange(null)
    }
  }

  private async syncUserData() {
    if (!this.user) return

    try {
      const supabaseClient = this.getSupabase()
      if (!supabaseClient) {
        console.error('Supabase not initialized')
        return
      }
      const { data: { user }, error } = await supabaseClient.auth.getUser()

      if (error) {
        console.error('Error fetching user data:', error)
        return
      }

      if (user) {
        this.user = user
      }
    } catch (error) {
      console.error('Error syncing user data:', error)
    }
  }

  private storeSession(session: any) {
    if (!session) return

    try {
      const sessionData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
        user: session.user
      }
      localStorage.setItem('coverimage_session', JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error storing session:', error)
    }
  }

  private getStoredSession() {
    try {
      const stored = localStorage.getItem('coverimage_session')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error retrieving stored session:', error)
      return null
    }
  }

  private clearStoredSession() {
    try {
      localStorage.removeItem('coverimage_session')
    } catch (error) {
      console.error('Error clearing stored session:', error)
    }
  }

  private isSessionValid(session: any) {
    if (!session || !session.expires_at) return false

    // Handle both Unix timestamp formats:
    // - If expires_at > 9999999999 (year 2286), it's already in milliseconds
    // - Otherwise, it's in seconds and needs to be multiplied by 1000
    const expiresAtMs = session.expires_at > 9999999999 
      ? session.expires_at 
      : session.expires_at * 1000
    
    const expiresAt = new Date(expiresAtMs)
    const now = new Date()
    const hasExpired = now >= expiresAt

    console.log('[Auth] Session validity check:', {
      expires_at: session.expires_at,
      expiresAtMs,
      expiresAtDate: expiresAt.toISOString(),
      nowDate: now.toISOString(),
      hasExpired,
      timeRemaining: hasExpired ? 0 : Math.round((expiresAt.getTime() - now.getTime()) / 1000) + 's'
    })

    if (hasExpired) {
      return false
    }

    return !!(session.access_token && session.refresh_token)
  }
  
  isSessionExpiringSoon(bufferMinutes: number = 5): boolean {
    if (!this.session?.expires_at) {
      console.log('[Auth] isSessionExpiringSoon: No session or expires_at')
      return true
    }
    
    // Handle both Unix timestamp formats:
    // - If expires_at > 9999999999 (year 2286), it's already in milliseconds
    // - Otherwise, it's in seconds and needs to be multiplied by 1000
    const expiresAtMs = this.session.expires_at > 9999999999 
      ? this.session.expires_at 
      : this.session.expires_at * 1000
      
    const expiresAt = new Date(expiresAtMs)
    const now = new Date()
    const timeUntilExpiry = expiresAt.getTime() - now.getTime()
    const bufferMs = bufferMinutes * 60 * 1000
    const isExpiring = timeUntilExpiry <= bufferMs
    
    console.log('[Auth] Session expiry check:', {
      expires_at: this.session.expires_at,
      expiresAtMs,
      expiresAtDate: expiresAt.toISOString(),
      nowDate: now.toISOString(),
      bufferMinutes,
      timeUntilExpiryMs: timeUntilExpiry,
      timeUntilExpiryMin: Math.round(timeUntilExpiry / 60000),
      bufferMs,
      isExpiring
    })
    
    return isExpiring
  }

  private startSessionRefreshTimer() {
    this.stopSessionRefreshTimer()

    this.sessionRefreshInterval = setInterval(async () => {
      if (this.user && this.session) {
        if (this.sessionNeedsRefresh()) {
          await this.refreshSession()
        }

        const thirtyMinutes = 30 * 60 * 1000
        const timeSinceLastCheck = Date.now() - (this.lastSessionCheck || 0)
        if (timeSinceLastCheck >= thirtyMinutes) {
          await this.refreshSession()
        }
      }
    }, 60 * 1000)
  }

  private stopSessionRefreshTimer() {
    if (this.sessionRefreshInterval) {
      clearInterval(this.sessionRefreshInterval)
      this.sessionRefreshInterval = null
    }
  }

  private sessionNeedsRefresh() {
    const expiryTime = this.getSessionExpiryTime()
    if (!expiryTime) return false

    const now = Date.now()
    const timeUntilExpiry = expiryTime - now
    const fiveMinutes = 5 * 60 * 1000

    return timeUntilExpiry <= fiveMinutes
  }

  private getSessionExpiryTime() {
    if (!this.session?.expires_at) return null
    
    // Handle both Unix timestamp formats:
    // - If expires_at > 9999999999 (year 2286), it's already in milliseconds
    // - Otherwise, it's in seconds and needs to be multiplied by 1000
    const expiresAtMs = this.session.expires_at > 9999999999 
      ? this.session.expires_at 
      : this.session.expires_at * 1000
      
    return expiresAtMs
  }

  async refreshSession() {
    if (this.sessionRefreshInProgress) {
      return { session: this.session, error: null }
    }

    this.sessionRefreshInProgress = true

    try {
      // First try to get the current session
      const supabaseClient = this.getSupabase()
      if (!supabaseClient) {
        return { session: this.session, error: new Error('Supabase not initialized') }
      }
      const { data: { session: currentSession } } = await supabaseClient.auth.getSession()
      
      if (currentSession && this.isSessionValid({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
        expires_at: currentSession.expires_at
      })) {
        // Session is still valid, use it
        this.session = currentSession
        this.user = currentSession.user
        this.lastSessionCheck = Date.now()
        this.storeSession(currentSession)
        if (this.onAuthChange) {
          this.onAuthChange(this.user)
        }
        return { session: currentSession, error: null }
      }

      // Session is expired or missing, try to refresh
      const { data: { session }, error } = await supabaseClient.auth.refreshSession()

      if (error) {
        // Handle specific error cases
        if (error.message?.includes('invalid') || error.message?.includes('expired')) {
          console.warn('[Auth] Refresh token invalid or expired, clearing session')
          this.user = null
          this.session = null
          this.clearStoredSession()
          if (this.onAuthChange) {
            this.onAuthChange(null)
          }
          return { session: null, error }
        }
        
        // For network errors, keep the existing session if we have one
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          console.warn('[Auth] Network error during refresh, keeping existing session')
          return { session: this.session, error }
        }
        
        throw error
      }

      if (session?.user) {
        this.session = session
        this.user = session.user
        this.lastSessionCheck = Date.now()
        this.storeSession(session)
        if (this.onAuthChange) {
          this.onAuthChange(this.user)
        }
      }

      return { session, error }
    } catch (error) {
      console.error('Error refreshing session:', error)
      // Keep existing session on error if we have one
      if (this.session && this.user) {
        return { session: this.session, error }
      }
      return { session: null, error }
    } finally {
      this.sessionRefreshInProgress = false
    }
  }

  destroy() {
    this.stopSessionRefreshTimer()
    if (this.authSubscription) {
      this.authSubscription.unsubscribe()
      this.authSubscription = null
    }
    this.initialized = false
    authServiceInstance = null
  }
}

export default new AuthService()