// Shared authentication types
export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    [key: string]: any
  }
  app_metadata?: {
    provider?: string
    [key: string]: any
  }
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at?: number
  expires_in?: number
  token_type?: string
  user: AuthUser
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  session?: AuthSession
  error?: string
  data?: any
}

export interface AuthProvider {
  signIn(options?: any): Promise<AuthResult>
  signOut(): Promise<AuthResult>
  handleCallback?(code: string): Promise<AuthResult>
  getSession?(): AuthSession | null
  isSessionValid?(): boolean
}

export type AuthEventType = 
  | 'auth:signin:success'
  | 'auth:signin:error'
  | 'auth:signout:success'
  | 'auth:signout:error'
  | 'auth:session:expired'
  | 'auth:session:refreshed'
  | 'auth:user:updated'
  | 'auth:profile:sync'

export interface AuthEvent {
  type: AuthEventType
  user?: AuthUser
  session?: AuthSession
  error?: string
  metadata?: Record<string, any>
}