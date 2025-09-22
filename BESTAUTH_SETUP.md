# BestAuth Setup Guide

## Overview
BestAuth is a custom authentication solution designed to replace Supabase Auth with a more reliable, simpler implementation that addresses all OAuth and cookie issues.

## Features
- Email/password authentication
- OAuth providers (Google, GitHub)
- Magic link authentication
- Password reset functionality
- JWT-based session management
- Secure cookie handling
- CSRF protection
- TypeScript-first design

## Setup Instructions

### 1. Database Setup

Run the following SQL script in your Supabase SQL editor to create the BestAuth schema:

```sql
-- Copy the contents of src/lib/bestauth/schema.sql and run in Supabase
```

### 2. Environment Variables

Add the following environment variables to your `.env.local`:

```env
# JWT Secret (generate a secure random string)
BESTAUTH_JWT_SECRET=your-super-secret-jwt-key-change-this

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Configuration (for magic links - optional)
EMAIL_FROM=noreply@yourapp.com
EMAIL_REPLY_TO=support@yourapp.com

# Supabase (for database only)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. OAuth Provider Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:3000/api/auth/callback/github` (development)
   - `https://yourdomain.com/api/auth/callback/github` (production)

### 4. Update Your App

1. Replace the AuthContext provider in your app:

```tsx
// src/app/providers.tsx or similar
import { BestAuthProvider } from '@/contexts/BestAuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BestAuthProvider>
      {children}
    </BestAuthProvider>
  )
}
```

2. Use the auth hook in your components:

```tsx
import { useAuth } from '@/contexts/BestAuthContext'

function MyComponent() {
  const { user, signIn, signOut } = useAuth()
  
  // Use auth functions
}
```

### 5. Testing

Visit `/test-bestauth` to test all authentication flows:
- Sign up with email/password
- Sign in with email/password
- OAuth authentication
- Session management
- Sign out

## Migration from Supabase Auth

To migrate existing users from Supabase Auth to BestAuth:

1. Create a migration script (example provided in architecture design)
2. Run migration during low-traffic period
3. Users with email/password will need to reset passwords
4. OAuth users will seamlessly continue working

## Key Differences from Supabase Auth

1. **No PKCE complexity**: Simple OAuth flow that works reliably
2. **Direct cookie control**: No more SameSite issues
3. **Database sessions**: Full control over session management
4. **Simple JWT tokens**: Easy to debug and understand
5. **No external dependencies**: Just your database and Next.js

## API Routes

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Check current session
- `GET /api/auth/oauth/[provider]` - Start OAuth flow
- `GET /api/auth/callback/[provider]` - OAuth callback
- `POST /api/auth/magic-link` - Send magic link
- `GET /api/auth/verify` - Verify magic link
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/reset-password/confirm` - Reset password with token

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret in production
2. **HTTPS Only**: Always use HTTPS in production
3. **Cookie Security**: Cookies are httpOnly, secure, and use appropriate SameSite
4. **CSRF Protection**: Built-in CSRF token validation for state-changing operations
5. **Password Security**: Bcrypt with configurable rounds
6. **Rate Limiting**: Implement rate limiting on auth endpoints in production

## Troubleshooting

### Cookie Issues
- Ensure your domain is correctly configured
- Check SameSite settings for OAuth flows
- Verify HTTPS is enabled in production

### OAuth Issues
- Verify redirect URIs match exactly
- Check OAuth app credentials
- Ensure state parameter is being preserved

### Session Issues
- Check JWT expiration settings
- Verify database connection
- Review session refresh logic

## Production Checklist

- [ ] Generate secure JWT secret
- [ ] Configure OAuth providers
- [ ] Set up email service for magic links
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Set up monitoring/logging
- [ ] Configure CORS if needed
- [ ] Test all auth flows
- [ ] Plan user migration strategy
- [ ] Update security headers