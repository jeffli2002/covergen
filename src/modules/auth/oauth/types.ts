// OAuth Module Types
export interface OAuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  provider: 'google' | 'github' | 'facebook'
  metadata?: Record<string, any>
}

export interface OAuthSession {
  user: OAuthUser | null
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
}

export interface OAuthState {
  session: OAuthSession | null
  loading: boolean
  error: OAuthError | null
  initialized: boolean
}

export interface OAuthError {
  code: string
  message: string
  details?: any
}

export type OAuthProvider = 'google' | 'github' | 'facebook'

export interface OAuthConfig {
  providers: OAuthProvider[]
  redirectUrl?: string
  onSuccess?: (user: OAuthUser) => void
  onError?: (error: OAuthError) => void
  autoRefresh?: boolean
  persistSession?: boolean
}

export interface OAuthEvents {
  onSignIn: (user: OAuthUser) => void
  onSignOut: () => void
  onError: (error: OAuthError) => void
  onSessionExpired: () => void
  onTokenRefreshed: (session: OAuthSession) => void
}