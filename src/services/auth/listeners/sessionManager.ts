import { authEventBus } from '../eventBus'
import { AuthEvent, AuthSession } from '../types'

// Session manager - handles session state independently
export class SessionManagerListener {
  private currentSession: AuthSession | null = null
  private unsubscribes: Array<() => void> = []
  private static instance: SessionManagerListener | null = null
  private sessionStorageKey = 'coverimage_session_modular'
  
  constructor() {
    if (SessionManagerListener.instance) {
      return SessionManagerListener.instance
    }
    SessionManagerListener.instance = this
    
    // Load any existing session from storage
    this.loadStoredSession()
  }
  
  start() {
    if (this.unsubscribes.length > 0) {
      console.log('[SessionManager] Already started')
      return
    }

    console.log('[SessionManager] Starting listener')
    
    // Listen for sign in success
    this.unsubscribes.push(
      authEventBus.on('auth:signin:success', (event: AuthEvent) => {
        console.log('[SessionManager] Session established')
        if (event.session) {
          this.currentSession = event.session
          this.storeSession(event.session)
        }
      })
    )

    // Listen for sign out
    this.unsubscribes.push(
      authEventBus.on('auth:signout:success', () => {
        console.log('[SessionManager] Session cleared')
        this.currentSession = null
        this.clearStoredSession()
      })
    )

    // Listen for session refresh
    this.unsubscribes.push(
      authEventBus.on('auth:session:refreshed', (event: AuthEvent) => {
        console.log('[SessionManager] Session refreshed')
        if (event.session) {
          this.currentSession = event.session
          this.storeSession(event.session)
        }
      })
    )

    // Listen for session expiry
    this.unsubscribes.push(
      authEventBus.on('auth:session:expired', () => {
        console.log('[SessionManager] Session expired')
        this.currentSession = null
        this.clearStoredSession()
      })
    )
  }

  stop() {
    console.log('[SessionManager] Stopping listener')
    this.unsubscribes.forEach(unsub => unsub())
    this.unsubscribes = []
  }

  getSession(): AuthSession | null {
    // First check memory
    if (this.currentSession && this.isSessionValid(this.currentSession)) {
      return this.currentSession
    }

    // Then check localStorage
    const stored = this.getStoredSession()
    if (stored && this.isSessionValid(stored)) {
      this.currentSession = stored
      return stored
    }

    // No valid session
    this.currentSession = null
    this.clearStoredSession()
    return null
  }

  private loadStoredSession() {
    const stored = this.getStoredSession()
    if (stored && this.isSessionValid(stored)) {
      this.currentSession = stored
      console.log('[SessionManager] Loaded stored session')
    }
  }

  private storeSession(session: AuthSession) {
    if (typeof window === 'undefined') return
    
    try {
      const sessionData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
        user: session.user
      }
      localStorage.setItem(this.sessionStorageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error('[SessionManager] Error storing session:', error)
    }
  }

  private getStoredSession(): AuthSession | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(this.sessionStorageKey)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('[SessionManager] Error retrieving stored session:', error)
      return null
    }
  }

  private clearStoredSession() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(this.sessionStorageKey)
      // Also try to clear old session formats
      localStorage.removeItem('coverimage_session')
      localStorage.removeItem('coverimage_session_v2')
    } catch (error) {
      console.error('[SessionManager] Error clearing stored session:', error)
    }
  }

  private isSessionValid(session: AuthSession): boolean {
    if (!session || !session.expires_at) return false

    const expiresAt = new Date(session.expires_at * 1000)
    const now = new Date()
    const valid = now < expiresAt
    
    if (!valid) {
      console.log('[SessionManager] Session expired:', {
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString()
      })
    }
    
    return valid
  }

  // Check if session is expiring soon
  isSessionExpiringSoon(bufferMinutes: number = 5): boolean {
    const session = this.getSession()
    if (!session || !session.expires_at) return true
    
    const expiresAt = new Date(session.expires_at * 1000)
    const now = new Date()
    const timeUntilExpiry = expiresAt.getTime() - now.getTime()
    const bufferMs = bufferMinutes * 60 * 1000
    
    return timeUntilExpiry <= bufferMs
  }

  // Static method to get instance
  static getInstance(): SessionManagerListener {
    if (!SessionManagerListener.instance) {
      SessionManagerListener.instance = new SessionManagerListener()
    }
    return SessionManagerListener.instance
  }
}

// Create and export singleton
export const sessionManagerListener = SessionManagerListener.getInstance()