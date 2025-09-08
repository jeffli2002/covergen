# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a global cover & poster generation tool for content creators across platforms like YouTube, Twitch, Spotify, Bilibili, TikTok, and Xiaohongshu. The system uses AI to generate consistent, high-quality cover images based on user-provided titles, avatars/logos, and style templates.

Key features:
- AI-powered cover generation with multiple candidates
- Local image editing with mask selection
- Multi-platform size presets
- Subscription-based monetization (Free/Pro/Pro+)
- Global deployment with region-specific services

## Commands for Development

### Frontend Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm run start

# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### Backend Services
```bash
# Install dependencies for all services
npm install

# Run specific microservice in development
npm run dev:auth-service
npm run dev:generation-service
npm run dev:edit-service
npm run dev:payment-service

# Run all services with docker-compose
docker-compose up -d

# Run tests for specific service
npm run test:auth-service

# Run integration tests
npm run test:integration
```

### Database Operations
```bash
# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Create new migration
npm run db:migration:create -- --name add_user_preferences
```

### Docker Commands
```bash
# Build all images
docker-compose build

# Run specific service
docker-compose up generation-service

# View logs
docker-compose logs -f generation-service

# Clean up containers and volumes
docker-compose down -v
```

## High-Level Architecture

### Frontend Architecture
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS + Radix UI/Shadcn components
- **State Management**: Zustand for client state, TanStack Query for server state
- **Image Manipulation**: Fabric.js for mask selection, Konva.js for canvas operations
- **i18n**: Built-in Next.js internationalization for multi-language support

### Backend Microservices Architecture
The system follows a microservices architecture with the following core services:

1. **Auth Service**: Handles user authentication via email/Google OAuth
2. **User Management Service**: Manages user profiles, subscriptions, and quotas
3. **Cover Generation Service**: Interfaces with AI APIs (Google Vertex AI/Aliyun Tongyi) for image generation
4. **Image Edit Service**: Handles local image editing with mask-based modifications
5. **Payment Service**: Integrates with Stripe/PayPal (international) and Alipay/WeChat Pay (China)
6. **Content Safety Service**: Validates generated content for compliance
7. **Task Management Service**: Manages async generation/edit job queues

### Data Flow Architecture
1. **API Gateway (Kong)**: Routes requests to appropriate microservices
2. **Message Queue (Redis)**: Handles async task processing
3. **Primary Database (PostgreSQL)**: Stores user data, tasks, and transactions
4. **Object Storage**: Google Cloud Storage (global) / Aliyun OSS (China)
5. **CDN**: Cloudflare (global) / Aliyun CDN (China)

### AI Integration Strategy
- **Primary**: Google Vertex AI with Gemini 2.5 Flash Vision model
- **China Fallback**: Aliyun Tongyi Wanxiang
- **Prompt Engineering**: Structured prompts for consistent style generation
- **Safety**: All AI-generated content includes SynthID watermarks

### Multi-Region Deployment
- **US Region**: Google Cloud Platform (us-east1)
- **EU Region**: Google Cloud Platform (europe-west3) - GDPR compliant
- **China Region**: Aliyun (cn-hangzhou) - ICP compliant
- **APAC Region**: Google Cloud Platform (asia-southeast1)

## Key Technical Decisions

1. **Next.js over Vue**: Better SEO, server-side rendering, and larger ecosystem
2. **PostgreSQL over NoSQL**: ACID compliance for payment transactions, JSON support for flexibility
3. **Microservices over Monolith**: Independent scaling, technology flexibility
4. **Kong API Gateway**: Rich plugin ecosystem, multi-protocol support
5. **Multi-Cloud Strategy**: Google Cloud (primary) + Aliyun (China) for compliance

## Security Considerations

1. **Authentication**: JWT tokens with 24h expiry, refresh tokens with 30d rotating expiry
2. **Content Safety**: Automated sensitive content detection and filtering
3. **Data Privacy**: GDPR/CCPA compliant with data localization per region
4. **AI Watermarking**: SynthID for content authenticity per regulations

## Common Development Patterns

### API Error Handling
All APIs return consistent error responses:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "details": { "field": "title", "reason": "Title must be between 1 and 200 characters" },
  "timestamp": "2025-08-28T10:30:00Z",
  "request_id": "req_1234567890abcdef"
}
```

### Task Queue Pattern
Generation/editing tasks are queued for async processing:
1. Client submits request → receives task_id
2. Task enters Redis queue with status "pending"
3. Worker processes task → updates status to "processing"
4. On completion → status "completed" with result_urls
5. Client polls or receives WebSocket notification

### Multi-Language Support
- Frontend: Use Next.js i18n with locale files in `/locales/{lang}.json`
- Backend: Accept `Accept-Language` header, return localized error messages
- AI Prompts: Include language parameter for localized text generation

## Testing Strategy

1. **Unit Tests**: Jest for both frontend and backend
2. **Integration Tests**: Test microservice interactions
3. **E2E Tests**: Playwright for critical user flows
4. **Load Tests**: K6 for performance testing
5. **AI Output Tests**: Validate generation quality and safety

## Performance Targets

- Single image generation: < 10 seconds (P90)
- API response time: < 200ms (P95)
- Frontend load time: < 2 seconds (P75)
- Availability: 99.9% uptime SLA

## Google OAuth Implementation Learning (3-Day Journey)

### The Core Problem: Multiple GoTrueClient Instances Warning
When implementing Google OAuth with Supabase in Next.js, you may encounter the warning "Multiple GoTrueClient instances detected in the same browser context". This seemingly simple warning led to a 3-day debugging journey with several key discoveries.

### Root Causes Identified

1. **Mixing OAuth flows**: Using both implicit flow (tokens in URL hash) and PKCE flow (server-side code exchange)
2. **Multiple client instances**: Creating Supabase clients in different ways across the codebase
3. **SSR complications**: Complex SSR client setup conflicting with OAuth callbacks
4. **Vercel deployment issues**: Environment-specific behavior differences between local and production

### The Ultimate Solution: Simplified Architecture

After extensive debugging, the solution was to simplify the entire OAuth architecture:

1. **Create a simple Supabase client** (`/src/lib/supabase-simple.ts`):
   ```typescript
   export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     auth: {
       autoRefreshToken: true,
       persistSession: true,
       detectSessionInUrl: true,
       flowType: 'pkce' // Use PKCE flow consistently
     }
   })
   ```

2. **Use PKCE OAuth callback route** (`/src/app/auth/callback/route.ts`):
   - Server-side route to exchange OAuth code for session
   - Handles secure cookie management
   - Redirects to original page after authentication

3. **Update authService redirect URL**:
   ```typescript
   const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`
   ```

4. **Remove ALL conflicting components**:
   - Remove OAuthHashHandler (for implicit flow)
   - Remove complex SSR client usage in OAuth-related code
   - Remove any middleware that touches authentication state

### Critical Debugging Steps That Led to the Solution

1. **Session State Analysis**:
   - Added comprehensive logging to track session states across components
   - Discovered race conditions between different auth state checks
   - Found that `onAuthStateChange` events were firing multiple times

2. **Vercel-Specific Issues**:
   - Local development worked but production failed
   - Environment variable timing issues in edge functions
   - Cookie handling differences between environments

3. **AuthContext Refactoring**:
   - Moved from complex SSR client to simple client-only approach
   - Added proper cleanup for auth listeners
   - Implemented single source of truth for auth state

### Implementation Details That Matter

1. **AuthContext Simplification**:
   ```typescript
   // BEFORE: Complex SSR setup
   const [supabaseClient] = useState(() => createServerClient(...))
   
   // AFTER: Simple client
   const supabaseClient = supabase // imported from supabase-simple.ts
   ```

2. **Session Management**:
   - Use `supabase.auth.getSession()` for initial state
   - Use `onAuthStateChange` for updates ONLY
   - Never mix server and client session checks in the same component

3. **Logout Implementation**:
   ```typescript
   // Ensure complete logout with server-side signout
   await supabase.auth.signOut()
   await fetch('/api/auth/signout', { method: 'POST' })
   router.push('/auth/signin')
   ```

### Environment-Specific Learnings

1. **Vercel Deployment**:
   - Edge functions have different behavior than Node.js runtime
   - Environment variables may not be available immediately
   - Use `force-dynamic` for auth-related API routes

2. **Cookie Configuration**:
   - Ensure cookies are set with proper domain and path
   - Use `sameSite: 'lax'` for OAuth compatibility
   - Set `secure: true` in production only

3. **Redirect URL Handling**:
   - Always use absolute URLs for OAuth redirects
   - Encode the 'next' parameter to preserve return paths
   - Handle both successful and error callbacks

### Key Takeaways from 3 Days of Debugging

1. **Start Simple**: Begin with the simplest possible implementation and add complexity only when needed
2. **Consistency is King**: Pick ONE OAuth flow (PKCE) and ONE client type - stick to them everywhere
3. **Debug Systematically**: Add logging at every auth touchpoint to understand the flow
4. **Test in Production**: Vercel/production environment behaves differently than local development
5. **Read the Source**: Understanding Supabase's GoTrueClient source code helped identify the root cause

### Common Pitfalls We Hit (So You Don't Have To)

- **Don't mix** `@supabase/supabase-js` and `@supabase/ssr` clients for OAuth
- **Don't use** implicit flow components with PKCE configuration
- **Don't create** multiple Supabase client instances in different files
- **Don't trust** that local development behavior matches production
- **Don't forget** to clean up auth listeners in useEffect
- **Always match** redirect URLs exactly in Supabase dashboard (trailing slashes matter!)

### Production Checklist

Before deploying OAuth to production:

1. ✓ Single Supabase client instance used everywhere
2. ✓ PKCE flow configured consistently
3. ✓ OAuth callback route properly implemented
4. ✓ Environment variables verified in deployment settings
5. ✓ Redirect URLs match exactly in provider dashboards
6. ✓ Proper error handling for OAuth failures
7. ✓ Logout clears both client and server sessions
8. ✓ Auth state persists across page refreshes

### The "Aha!" Moment

The breakthrough came when we realized that the complexity was the enemy. By removing all the "smart" SSR optimizations and middleware checks, and going back to a simple client-side auth flow with a server-side callback, everything just worked. Sometimes, the best solution is the simplest one.

This approach ensures a clean, working Google OAuth implementation that can be adapted for other OAuth providers supported by Supabase. The 3-day struggle taught us that when dealing with authentication, simplicity and consistency triumph over clever optimizations.

### OAuth Flow Architecture

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. Google redirects to /auth/callback with code
4. Server route redirects to /auth/callback-pkce
5. Client-side PKCE handler exchanges code for session
6. Session established, user redirected to original page

The implementation now strictly follows:
- SupabaseGuideline.txt - Single client, PKCE flow
- CLAUDE.md - Lessons from 3-day debugging journey
- Web应用技术方案.md - Overall architecture patterns

## Critical: Payment and OAuth Integration Separation

### The Golden Rule: Payment Services Must NEVER Modify Auth State

After fixing OAuth with a simplified architecture, it's crucial that payment integrations don't reintroduce the complexity that caused the original issues. Payment services must be **read-only consumers** of authentication state.

### Payment Integration Architecture

1. **Use PaymentAuthWrapper** (`/src/services/payment/auth-wrapper.ts`):
   - Provides read-only access to auth context
   - Validates session has sufficient time remaining (5+ minutes)
   - Never refreshes or modifies sessions
   - Returns auth headers without state manipulation

2. **Forbidden Operations in Payment Code**:
   ```typescript
   // ❌ NEVER do these in payment flows:
   await authService.refreshSession()
   await authService.ensureValidSession()
   await supabase.auth.setSession()
   await supabase.auth.refreshSession()
   
   // ✅ ALWAYS use read-only access:
   const context = await PaymentAuthWrapper.getAuthContext()
   const isValid = PaymentAuthWrapper.isSessionValidForPayment()
   ```

3. **Session Validity Requirements**:
   - Checkout initiation: Requires 5+ minutes remaining
   - If invalid: Redirect to sign-in, don't refresh
   - Webhooks: Use admin client, never touch user sessions

4. **Webhook Processing Isolation**:
   - Use service role Supabase client
   - No auto-refresh: `autoRefreshToken: false`
   - No session persistence: `persistSession: false`
   - Database operations only, no auth state changes

### Why This Matters

The OAuth implementation uses a single, simple Supabase client with PKCE flow. Any attempt by payment services to create new clients, refresh sessions, or manipulate auth state can trigger the "Multiple GoTrueClient instances" error and break the entire auth flow.

### Quick Reference

| Component | Auth Approach | Key Rule |
|-----------|--------------|----------|
| Payment Pages | Read auth via wrapper | Never refresh sessions |
| API Routes | Validate token only | No setSession calls |
| Webhooks | Use admin client | No user auth interaction |
| Creem Service | Get headers from wrapper | No direct auth access |

### Testing Payment Features

Always verify these after payment changes:
1. No "Multiple GoTrueClient" warnings in console
2. OAuth login still works after payment attempts
3. Sessions persist correctly across payment redirects
4. Logout functions properly after payments

Remember: If payment code needs fresh auth, **redirect to sign-in**, don't try to refresh inline. The auth system will handle it correctly.