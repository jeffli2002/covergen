// BestAuth Core Functions
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { authConfig } from './config'
import { db } from './db'
import type {
  User,
  AuthResult,
  SignUpData,
  SignInData,
  TokenPayload,
  AuthSession,
} from './types'

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, authConfig.security.bcryptRounds)
}

// Verify a password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate a random token
export function generateToken(bytes: number = authConfig.security.tokenLength): string {
  return randomBytes(bytes).toString('hex')
}

// Hash a token (for storage)
export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 6) // Lower rounds for tokens
}

// Create a JWT
export function createJWT(payload: TokenPayload): string {
  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.expiresIn,
  } as jwt.SignOptions)
}

// Verify a JWT
export function verifyJWT(token: string): TokenPayload {
  return jwt.verify(token, authConfig.jwt.secret) as TokenPayload
}

// Sign up with email and password
export async function signUp({
  email,
  password,
  name,
  sessionId,
}: SignUpData & { sessionId?: string }): Promise<AuthResult<AuthSession>> {
  try {
    // Check if user already exists
    const existingUser = await db.users.findByEmail(email)
    if (existingUser) {
      return {
        success: false,
        error: 'User already exists',
        code: 'USER_EXISTS',
      }
    }

    // Create user
    const user = await db.users.create({
      email,
      name,
      emailVerified: false,
    })

    // Hash and store password
    const passwordHash = await hashPassword(password)
    await db.credentials.create(user.id, passwordHash)

    // Send verification email
    try {
      const { emailService } = await import('@/lib/email/service')
      
      // Generate verification token
      const verificationToken = generateToken()
      const tokenHash = await hashToken(verificationToken)
      
      // Store verification token
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry
      
      await db.verificationTokens.create({
        email: user.email,
        token: tokenHash,
        expires_at: expiresAt
      })
      
      // Send email
      const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${verificationToken}`
      
      // Get email template
      const { getVerificationEmailTemplate } = await import('@/lib/email/templates/verification')
      const { html, text } = getVerificationEmailTemplate({
        email: user.email,
        verificationUrl,
        name: user.name
      })
      
      // Send verification email
      await emailService.send({
        to: user.email,
        subject: 'Verify your email - CoverGen Pro',
        html,
        text
      })
      
      console.log('[BestAuth] Verification email sent to:', user.email)
    } catch (emailError) {
      // Log error but don't fail signup
      console.error('[BestAuth] Failed to send verification email:', emailError)
    }

    // Merge session usage if sessionId is provided
    if (sessionId) {
      try {
        console.log('[BestAuth] Merging session usage for new user:', user.id, 'session:', sessionId)
        const merged = await db.usage.mergeSessionUsageToUser(user.id, sessionId)
        if (merged) {
          console.log('[BestAuth] Successfully merged session usage')
        }
      } catch (mergeError) {
        console.error('[BestAuth] Failed to merge session usage:', mergeError)
      }
    }

    // Grant signup bonus credits directly to BestAuth subscription
    try {
      const { SUBSCRIPTION_CONFIG } = await import('@/config/subscription')
      const signupBonus = SUBSCRIPTION_CONFIG.signupBonus.free
      
      if (signupBonus > 0) {
        const { getBestAuthSupabaseClient } = await import('@/lib/bestauth/db-client')
        const supabaseAdmin = getBestAuthSupabaseClient()
        
        if (supabaseAdmin) {
          // Get user's subscription (should already exist from createSubscription)
          const { data: subscription } = await supabaseAdmin
            .from('bestauth_subscriptions')
            .select('id, points_balance, points_lifetime_earned')
            .eq('user_id', user.id)
            .single()
          
          if (subscription) {
            const currentBalance = subscription.points_balance ?? 0
            const currentLifetimeEarned = subscription.points_lifetime_earned ?? 0
            const newBalance = currentBalance + signupBonus
            const newLifetimeEarned = currentLifetimeEarned + signupBonus
            
            // Update subscription with signup bonus
            const { error: updateError } = await supabaseAdmin
              .from('bestauth_subscriptions')
              .update({
                points_balance: newBalance,
                points_lifetime_earned: newLifetimeEarned,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
            
            if (updateError) {
              console.error('[BestAuth] Failed to grant signup bonus:', updateError)
            } else {
              console.log(`[BestAuth] ✅ Granted ${signupBonus} signup bonus credits to new user ${user.id}`)
              console.log(`[BestAuth]    Balance: ${currentBalance} → ${newBalance}`)
              
              // Create transaction record
              const { error: txError } = await supabaseAdmin
                .from('bestauth_points_transactions')
                .insert({
                  user_id: user.id,
                  amount: signupBonus,
                  balance_after: newBalance,
                  transaction_type: 'signup_bonus',
                  subscription_id: subscription.id,
                  description: `Welcome bonus: ${signupBonus} credits`,
                  metadata: {
                    source: 'signup',
                    bonus_type: 'welcome',
                    method: 'email'
                  }
                })
              
              if (txError) {
                console.error('[BestAuth] Failed to create signup bonus transaction:', txError)
              } else {
                console.log('[BestAuth] Signup bonus transaction record created')
              }
            }
          } else {
            console.error('[BestAuth] No subscription found for new user - cannot grant signup bonus')
          }
        }
      }
    } catch (pointsError) {
      console.error('[BestAuth] Failed to grant signup bonus:', pointsError)
    }

    // Create session
    const session = await createSession(user)

    // Log activity
    await db.activityLogs.create({
      userId: user.id,
      action: 'signup',
      metadata: { method: 'email' },
    })

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return {
      success: false,
      error: 'Failed to create account',
      code: 'SIGNUP_ERROR',
    }
  }
}

// Sign in with email and password
export async function signIn({
  email,
  password,
}: SignInData): Promise<AuthResult<AuthSession>> {
  try {
    // Find user
    const user = await db.users.findByEmail(email)
    if (!user) {
      return {
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      }
    }

    // Get password hash
    const credentials = await db.credentials.findByUserId(user.id)
    if (!credentials) {
      return {
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      }
    }

    // Verify password
    const isValid = await verifyPassword(password, credentials.passwordHash)
    if (!isValid) {
      return {
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      }
    }

    // Update last sign-in timestamp
    await db.users.updateLastSignIn(user.id)

    // Create session
    const session = await createSession(user)

    // Log activity
    await db.activityLogs.create({
      userId: user.id,
      action: 'signin',
      metadata: { method: 'email' },
    })

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return {
      success: false,
      error: 'Failed to sign in',
      code: 'SIGNIN_ERROR',
    }
  }
}

// Create a session for a user
export async function createSession(
  user: User,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<AuthSession> {
  // Generate session token
  const sessionToken = generateToken()
  const tokenHash = await hashToken(sessionToken)

  // Calculate expiration
  const expiresAt = new Date()
  expiresAt.setSeconds(expiresAt.getSeconds() + authConfig.session.maxAge)

  // Create session in database
  const session = await db.sessions.create({
    userId: user.id,
    tokenHash,
    expiresAt,
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent,
  })

  // Create JWT
  const accessToken = createJWT({
    userId: user.id,
    email: user.email,
    sessionId: session.id,
  })

  return {
    user,
    accessToken,
    expiresAt,
  }
}

// Validate a session token
export async function validateSession(token: string): Promise<AuthResult<User>> {
  try {
    // Verify JWT
    const payload = verifyJWT(token)

    // Get user
    const user = await db.users.findById(payload.userId)
    if (!user) {
      return {
        success: false,
        error: 'Invalid session',
        code: 'INVALID_SESSION',
      }
    }

    // Update last accessed time
    await db.sessions.updateLastAccessed(payload.sessionId)

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Invalid session',
      code: 'INVALID_SESSION',
    }
  }
}

// Sign out (invalidate session)
export async function signOut(sessionId: string): Promise<AuthResult<void>> {
  try {
    await db.sessions.delete(sessionId)
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: 'Failed to sign out',
      code: 'SIGNOUT_ERROR',
    }
  }
}

// Send magic link
export async function sendMagicLink(email: string): Promise<AuthResult<void>> {
  try {
    // Generate token
    const token = generateToken()
    const tokenHash = await hashToken(token)

    // Calculate expiration
    const expiresAt = new Date()
    expiresAt.setMilliseconds(
      expiresAt.getMilliseconds() + authConfig.security.magicLinkExpiresIn
    )

    // Store in database
    await db.magicLinks.create(email, tokenHash, expiresAt)

    // TODO: Send email with magic link
    // For now, log the token
    console.log('Magic link token:', token)

    return { success: true }
  } catch (error) {
    console.error('Magic link error:', error)
    return {
      success: false,
      error: 'Failed to send magic link',
      code: 'MAGIC_LINK_ERROR',
    }
  }
}

// Verify magic link
export async function verifyMagicLink(token: string): Promise<AuthResult<AuthSession>> {
  try {
    const tokenHash = await hashToken(token)

    // Find magic link
    const magicLink = await db.magicLinks.findByTokenHash(tokenHash)
    if (!magicLink || magicLink.used) {
      return {
        success: false,
        error: 'Invalid or expired link',
        code: 'INVALID_LINK',
      }
    }

    // Mark as used
    await db.magicLinks.markAsUsed(tokenHash)

    // Find or create user
    let user = await db.users.findByEmail(magicLink.email)
    if (!user) {
      user = await db.users.create({
        email: magicLink.email,
        emailVerified: true,
      })
    } else {
      // Mark email as verified
      await db.users.update(user.id, { emailVerified: true })
    }

    // Update last sign-in timestamp
    await db.users.updateLastSignIn(user.id)

    // Create session
    const session = await createSession(user)

    // Log activity
    await db.activityLogs.create({
      userId: user.id,
      action: 'magic_link_signin',
    })

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error('Magic link verification error:', error)
    return {
      success: false,
      error: 'Failed to verify link',
      code: 'VERIFICATION_ERROR',
    }
  }
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<AuthResult<void>> {
  try {
    // Find user
    const user = await db.users.findByEmail(email)
    if (!user) {
      // Don't reveal if user exists
      return { success: true }
    }

    // Generate token
    const token = generateToken()
    const tokenHash = await hashToken(token)

    // Calculate expiration
    const expiresAt = new Date()
    expiresAt.setMilliseconds(
      expiresAt.getMilliseconds() + authConfig.security.passwordResetExpiresIn
    )

    // Store in database
    await db.passwordResets.create(user.id, tokenHash, expiresAt)

    // TODO: Send email with reset link
    // For now, log the token
    console.log('Password reset token:', token)

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      error: 'Failed to send reset email',
      code: 'RESET_ERROR',
    }
  }
}

// Reset password
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<AuthResult<void>> {
  try {
    const tokenHash = await hashToken(token)

    // Find reset token
    const resetToken = await db.passwordResets.findByTokenHash(tokenHash)
    if (!resetToken || resetToken.used) {
      return {
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      }
    }

    // Mark as used
    await db.passwordResets.markAsUsed(tokenHash)

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update password
    await db.credentials.update(resetToken.userId, passwordHash)

    // Log activity
    await db.activityLogs.create({
      userId: resetToken.userId,
      action: 'password_reset',
    })

    // Invalidate all sessions for security
    await db.sessions.deleteByUserId(resetToken.userId)

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      error: 'Failed to reset password',
      code: 'RESET_ERROR',
    }
  }
}