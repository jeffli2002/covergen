// BestAuth Types

export interface User {
  id: string
  email: string
  emailVerified: boolean
  name?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  lastAccessed: Date
}

export interface AuthSession {
  user: User
  accessToken: string
  expiresAt: Date
}

export interface OAuthAccount {
  id: string
  userId: string
  provider: 'google' | 'github'
  providerAccountId: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
}

export interface SignUpData {
  email: string
  password: string
  name?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface MagicLinkData {
  email: string
  redirectTo?: string
}

export interface AuthResult<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface TokenPayload {
  userId: string
  email: string
  sessionId: string
  iat?: number
  exp?: number
}

export interface OAuthUserInfo {
  id: string
  email: string
  name?: string
  picture?: string
  email_verified?: boolean
}

export type AuthProvider = 'email' | 'google' | 'github' | 'magic_link'

export interface AuthError extends Error {
  code: string
  statusCode: number
}