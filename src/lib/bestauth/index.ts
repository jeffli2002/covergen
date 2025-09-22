// BestAuth - Main Export
export * from './types'
export * from './core'
export * from './oauth'
export * from './cookies'
export * from './middleware'
export * from './request-utils'
export { authConfig } from './config'
export { db as authDb } from './db'

// Re-export main functions for convenience
export {
  signUp,
  signIn,
  signOut,
  validateSession,
  createSession,
  sendMagicLink,
  verifyMagicLink,
  requestPasswordReset,
  resetPassword,
} from './core'

export {
  getOAuthAuthorizationUrl,
  handleOAuthCallback,
  generateOAuthState,
} from './oauth'

export {
  authMiddleware,
  getUserFromRequest,
  withAuth,
} from './middleware'

export {
  validateSessionFromRequest,
  extractBearerToken,
} from './request-utils'