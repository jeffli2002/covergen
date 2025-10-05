// BestAuth OAuth Implementation
import { randomUUID } from 'crypto'
import { authConfig } from './config'
import { db } from './db'
import { createSession } from './core'
import type { AuthResult, AuthSession, OAuthUserInfo } from './types'
import { setupWSL2DNSFix, fetchWithWSL2Fix } from './wsl2-dns-fix'

// Apply WSL2 DNS fix on module load
setupWSL2DNSFix();

// Generate OAuth authorization URL
export function getOAuthAuthorizationUrl(
  provider: 'google' | 'github',
  state: string,
  redirectUri: string
): string {
  const config = authConfig.oauth[provider]
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: config.scope,
    state,
    response_type: 'code',
    ...(provider === 'google' && { access_type: 'offline', prompt: 'consent' }),
  })

  return `${config.authorizationUrl}?${params.toString()}`
}

// Exchange OAuth code for tokens
async function exchangeCodeForTokens(
  provider: 'google' | 'github',
  code: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token?: string; expires_in?: number }> {
  const config = authConfig.oauth[provider]
  
  console.log('=== exchangeCodeForTokens ===');
  console.log('Provider:', provider);
  console.log('Config:', {
    clientId: config.clientId ? 'SET' : 'MISSING',
    clientSecret: config.clientSecret ? 'SET' : 'MISSING',
    tokenUrl: config.tokenUrl
  })

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })

  console.log('Token exchange request to:', config.tokenUrl);
  console.log('Request body params:', {
    client_id: params.get('client_id'),
    redirect_uri: params.get('redirect_uri'),
    grant_type: params.get('grant_type')
  });

  let response;
  try {
    // Use WSL2-aware fetch with retries and better DNS handling
    response = await fetchWithWSL2Fix(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    })
  } catch (fetchError) {
    console.error('Network error during token exchange:', fetchError);
    
    // Check if it's a timeout error
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      throw new Error('Network timeout: Request to OAuth provider took too long (30s). Check your network connection or proxy settings.');
    }
    
    // Check for common network errors
    if (fetchError instanceof Error && fetchError.message.includes('ETIMEDOUT')) {
      throw new Error('Network timeout: Cannot connect to Google OAuth. Are you behind a firewall or proxy? You may need to set HTTP_PROXY/HTTPS_PROXY environment variables.');
    }
    
    throw new Error(`Network error: Unable to reach OAuth provider. ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
  }

  console.log('Token exchange response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token exchange error response:', errorText);
    
    // Parse Google OAuth error response
    let errorDetails = '';
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error) {
        errorDetails = ` (${errorJson.error}${errorJson.error_description ? ': ' + errorJson.error_description : ''})`;
      }
    } catch (e) {
      // If not JSON, use the text as is
      errorDetails = errorText ? ` - ${errorText}` : '';
    }
    
    throw new Error(`OAuth token exchange failed: ${response.statusText}${errorDetails}`)
  }

  return response.json()
}

// Get user info from OAuth provider
async function getOAuthUserInfo(
  provider: 'google' | 'github',
  accessToken: string
): Promise<OAuthUserInfo> {
  const config = authConfig.oauth[provider]

  const response = await fetchWithWSL2Fix(config.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`)
  }

  const data = await response.json()

  // Handle GitHub email separately if needed
  let email = data.email
  if (provider === 'github' && !email) {
    const emailResponse = await fetch(authConfig.oauth.github.emailUrl!, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })
    
    if (emailResponse.ok) {
      const emails = await emailResponse.json()
      const primaryEmail = emails.find((e: any) => e.primary && e.verified)
      email = primaryEmail?.email
    }
  }

  // Normalize user info
  return {
    id: String(data.id || data.sub),
    email: email || data.email,
    name: data.name || data.login,
    picture: data.picture || data.avatar_url,
    email_verified: data.email_verified ?? true,
  }
}

// Handle OAuth callback
export async function handleOAuthCallback(
  provider: 'google' | 'github',
  code: string,
  redirectUri: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<AuthResult<AuthSession>> {
  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(provider, code, redirectUri)

    // Get user info
    const userInfo = await getOAuthUserInfo(provider, tokens.access_token)

    if (!userInfo.email) {
      return {
        success: false,
        error: 'Email not provided by OAuth provider',
        code: 'NO_EMAIL',
      }
    }

    // Check if OAuth account exists
    const oauthAccount = await db.oauthAccounts.findByProvider(provider, userInfo.id)

    let user
    if (oauthAccount) {
      // Existing OAuth account - get user
      user = await db.users.findById(oauthAccount.userId)
      
      // Update tokens
      await db.oauthAccounts.update(oauthAccount.id, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : undefined,
      })
    } else {
      // New OAuth account - check if user exists with this email
      user = await db.users.findByEmail(userInfo.email)
      
      if (!user) {
        // Create new user
        user = await db.users.create({
          email: userInfo.email,
          name: userInfo.name,
          avatarUrl: userInfo.picture,
          emailVerified: userInfo.email_verified,
        })
      }

      // Create OAuth account
      await db.oauthAccounts.create({
        userId: user.id,
        provider,
        providerAccountId: userInfo.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : undefined,
      })
    }

    if (!user) {
      return {
        success: false,
        error: 'Failed to create or find user',
        code: 'USER_ERROR',
      }
    }

    // Update last sign-in timestamp
    await db.users.updateLastSignIn(user.id)

    // Create session
    const session = await createSession(user, metadata)

    // Log activity
    await db.activityLogs.create({
      userId: user.id,
      action: 'oauth_signin',
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      metadata: { provider },
    })

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      provider,
      code: code ? 'Code present' : 'No code',
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth authentication failed',
      code: 'OAUTH_ERROR',
    }
  }
}

// Generate a secure random state for OAuth
export function generateOAuthState(): string {
  return Buffer.from(randomUUID()).toString('base64url')
}