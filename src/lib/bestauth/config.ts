// BestAuth Configuration

// Validate required environment variables
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  BESTAUTH_JWT_SECRET: process.env.BESTAUTH_JWT_SECRET,
};

// Log environment variables status (only on server-side)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('=== BestAuth Config Loading ===');
  console.log('Runtime:', process.env.NEXT_RUNTIME || 'nodejs');
  console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
  console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing');
  console.log('JWT Secret:', process.env.BESTAUTH_JWT_SECRET ? 'Set' : 'Missing');
}

// Log missing variables in development
if (process.env.NODE_ENV === 'development') {
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      console.warn(`⚠️  Missing required environment variable: ${key}`);
    }
  });
}

// Check if we're in WSL2 development environment
const isWSL2Dev = process.env.NODE_ENV === 'development' && 
  typeof window === 'undefined' &&
  process.platform === 'linux' && 
  process.env.WSL_DISTRO_NAME !== undefined;

if (isWSL2Dev) {
  console.log('🔧 WSL2 detected: Using mock OAuth endpoints to bypass network issues');
}

export const authConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.BESTAUTH_JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '7d', // JWT token expiration
  },

  // Session Configuration
  session: {
    name: 'bestauth.session',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    httpOnly: true,
    // For Vercel preview deployments, always use secure cookies since they're HTTPS
    // For local development, don't use secure cookies
    secure: process.env.NODE_ENV === 'production' || process.env.VERCEL_URL !== undefined,
    sameSite: 'lax' as const, // Use 'none' for OAuth if needed
    path: '/',
  },

  // OAuth Configuration
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: isWSL2Dev 
        ? 'http://localhost:3001/api/mock-oauth/google'
        : 'https://oauth2.googleapis.com/token',
      userInfoUrl: isWSL2Dev 
        ? 'http://localhost:3001/api/mock-oauth/google'
        : 'https://www.googleapis.com/oauth2/v2/userinfo',
      scope: 'openid email profile',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
      emailUrl: 'https://api.github.com/user/emails',
      scope: 'user:email',
    },
  },

  // Email Configuration (for magic links)
  email: {
    from: process.env.EMAIL_FROM || 'noreply@coverimage.ai',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@coverimage.ai',
  },

  // Security Configuration
  security: {
    bcryptRounds: 10,
    tokenLength: 32, // Length of random tokens (magic links, etc)
    magicLinkExpiresIn: 60 * 60 * 1000, // 1 hour
    passwordResetExpiresIn: 60 * 60 * 1000, // 1 hour
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // URLs
  urls: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyEmail: '/auth/verify',
    resetPassword: '/auth/reset-password',
    callback: '/auth/callback',
    afterSignIn: '/en',
    afterSignOut: '/',
  },
}

export type AuthConfig = typeof authConfig