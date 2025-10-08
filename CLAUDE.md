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

## Google OAuth Implementation Solution (Updated)

### Problem: OAuth Callback Hanging
When implementing Google OAuth with Supabase in Next.js, the OAuth callback was hanging with "Exchanging code for session..." due to:

1. **PKCE verifier storage**: PKCE flow stores verifier in browser sessionStorage
2. **Server-side callback limitation**: Server-side routes can't access browser storage
3. **Client mismatch**: Different Supabase client instances between OAuth initiation and callback

### Solution: Server-Side OAuth with Implicit Flow (Same as next-supabase-stripe-starter)

After analyzing the working next-supabase-stripe-starter project, we implemented their exact approach:

1. **Remove PKCE Configuration** (`/src/lib/supabase.ts`):
   ```typescript
   auth: {
     autoRefreshToken: true,
     persistSession: true,
     detectSessionInUrl: true
     // No flowType: 'pkce' - uses implicit flow by default
   }
   ```

2. **Use Server Actions for OAuth** (`/src/app/actions/auth.ts`):
   ```typescript
   export async function signInWithGoogleAction(currentPath: string) {
     const supabase = await createSupabaseServerClient()
     const { data, error } = await supabase.auth.signInWithOAuth({
       provider: 'google',
       options: {
         redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${currentPath}`
       }
     })
     if (data.url) redirect(data.url)
   }
   ```

3. **Server-Side OAuth Callback** (`/src/app/auth/callback/route.ts`):
   ```typescript
   export async function GET(request: Request) {
     const { searchParams, origin } = new URL(request.url)
     const code = searchParams.get('code')
     const next = searchParams.get('next') ?? '/'

     if (code) {
       const cookieStore = await cookies()
       const supabase = createServerClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
         {
           cookies: {
             get(name: string) { return cookieStore.get(name)?.value },
             set(name: string, value: string, options: CookieOptions) {
               cookieStore.set({ name, value, ...options })
             },
             remove(name: string) { cookieStore.delete(name) }
           }
         }
       )
       
       const { error } = await supabase.auth.exchangeCodeForSession(code)
       if (!error) return NextResponse.redirect(`${origin}${next}`)
     }
     
     return NextResponse.redirect(`${origin}/auth/error`)
   }
   ```

4. **Update AuthService**:
   ```typescript
   async signInWithGoogle() {
     const currentPath = window.location.pathname || '/'
     const { signInWithGoogleAction } = await import('@/app/actions/auth')
     const result = await signInWithGoogleAction(currentPath)
     // Server action handles redirect
   }
   ```

### Key Differences from PKCE Approach

| Aspect | PKCE Flow (Previous) | Implicit Flow (Current) |
|--------|---------------------|------------------------|
| Verifier Storage | Browser sessionStorage | Not needed |
| Callback Handler | Must be client-side | Can be server-side |
| Security | More secure | Standard security |
| Implementation | More complex | Simpler |

### Why This Works

1. **No PKCE verifier needed**: Implicit flow doesn't require browser storage access
2. **Server-side handling**: All OAuth operations happen server-side
3. **Consistent with starter**: Matches proven implementation from next-supabase-stripe-starter
4. **Simpler architecture**: No client/server mismatch issues

### Testing

1. Clear all cookies and storage
2. Navigate to login page
3. Click "Sign in with Google"
4. OAuth flow completes server-side
5. User is authenticated and redirected

### Important Notes

- Always ensure redirect URLs are configured in Supabase dashboard
- The implicit flow is less secure than PKCE but works with server-side callbacks
- This approach matches successful production implementations
- All OAuth test pages have been updated to use server actions

## Chrome OAuth SameSite Cookie Fix (2025-01-27)

### Problem: Chrome OAuth Failure with Edge Success
Chrome browser was silently dropping authentication cookies during OAuth redirect, causing OAuth to fail while Edge browser worked normally. This was due to Chrome's stricter SameSite cookie requirements for cross-site OAuth flows.

### Root Cause
Chrome browser requires `SameSite=None; Secure` cookies for cross-site OAuth flows, but the application was using `SameSite=Lax` which Chrome silently drops during OAuth redirects.

### Solution: SameSite=None; Secure Cookie Configuration

#### 1. Updated Supabase Client Cookie Configuration (`src/lib/supabase.ts`)
```typescript
// For OAuth flows, we need SameSite=None; Secure for Chrome compatibility
const isOAuthFlow = name.startsWith('sb-') && (name.includes('auth') || name.includes('session'))
const sameSiteValue = isOAuthFlow ? 'None' : (options?.sameSite || 'Lax')
cookieParts.push(`SameSite=${sameSiteValue}`)

// Always set Secure for SameSite=None cookies (required by Chrome)
if (sameSiteValue === 'None' || window.location.protocol === 'https:' || options?.secure) {
  cookieParts.push('Secure')
}
```

#### 2. Updated Alternative Client Configuration (`src/utils/supabase/client.ts`)
```typescript
// For OAuth flows, we need SameSite=None; Secure for Chrome compatibility
const isOAuthFlow = name.startsWith('sb-') && (name.includes('auth') || name.includes('session'))
const sameSiteValue = isOAuthFlow ? 'None' : (options?.sameSite || 'lax')
cookieString += `; samesite=${sameSiteValue}`

// Always set Secure for SameSite=None cookies (required by Chrome)
if (sameSiteValue === 'None' || options?.secure) {
  cookieString += `; secure`
}
```

#### 3. Updated OAuth Configuration (`src/lib/supabase-oauth-config.ts`)
```typescript
// Cookie options for production vs development
// For OAuth flows, we need SameSite=None; Secure for Chrome compatibility
const cookieOptions = {
  domain: isProduction && typeof window !== 'undefined' 
    ? `.${window.location.hostname.replace('www.', '')}` // .covergen.pro
    : undefined, // Let browser handle it in dev
  sameSite: 'none' as const, // Required for cross-site OAuth flows in Chrome
  secure: true, // Always required for SameSite=None
  maxAge: 60 * 60 * 24 * 30, // 30 days
}
```

### Current Production Architecture

#### Server-Side OAuth Flow (Confirmed Working)
- **Framework**: Next.js 14+ App Router with SSR
- **OAuth Flow**: PKCE with server-side code exchange
- **Authentication**: Supabase SSR with server-side cookie handling
- **Callback Handler**: Server-side route (`/auth/callback/route.ts`)

#### OAuth Flow Process
1. User clicks Google login → Redirects to Google OAuth
2. Google callback to `/auth/callback` (server-side route)
3. Server exchanges authorization code for session using `exchangeCodeForSession()`
4. Server sets authentication cookies with `SameSite=None; Secure`
5. Redirect to target page with authenticated session

#### Browser Compatibility
- ✅ **Chrome**: Now works with `SameSite=None; Secure` cookies
- ✅ **Edge**: Continues to work (more lenient SameSite handling)
- ✅ **Safari**: Compatible with SameSite=None configuration
- ✅ **Firefox**: Compatible with SameSite=None configuration

### Key Requirements for Production
1. **HTTPS Required**: `SameSite=None; Secure` only works over HTTPS
2. **Proper Domain Configuration**: Ensure Supabase redirect URLs match exactly
3. **Cookie Security**: All OAuth-related cookies must use `SameSite=None; Secure`

### Testing Verification
- Chrome OAuth flow now completes successfully
- Edge OAuth flow continues to work normally
- Authentication state persists across page refreshes
- Cross-site cookie handling works correctly

### Files Modified
- `src/lib/supabase.ts` - Main Supabase client cookie configuration
- `src/utils/supabase/client.ts` - Alternative client cookie configuration  
- `src/lib/supabase-oauth-config.ts` - OAuth-specific configuration
- `CHROME_OAUTH_SAMESITE_FIX.md` - Detailed fix documentation

### Important Notes
- This fix maintains backward compatibility with Edge and other browsers
- Production environment must use HTTPS for `SameSite=None; Secure` to work
- Local development may still have issues due to HTTP limitations
- All OAuth-related cookies now properly configured for Chrome compatibility

## BestAuth Integration (2025-01-28)

### Overview
We are migrating from Supabase Auth to BestAuth as the primary authentication system. BestAuth is a custom authentication solution with JWT-based sessions, OAuth support, and comprehensive subscription management. Supabase Auth remains as a backup fallback option.

### Migration Status
- ✅ **Database Migration**: Complete - all user data migrated to BestAuth tables
- ✅ **Core BestAuth Library**: Implemented with full auth functionality
- ✅ **React Hooks**: `useBestAuth` hook available for client-side auth
- ✅ **API Routes**: BestAuth endpoints created for auth operations
- ⚠️ **UI Integration**: Partial - account page updated, other components pending
- ❌ **Payment Integration**: Pending - needs webhook updates
- ❌ **Generation Service**: Pending - needs session validation updates

### BestAuth Architecture

#### Core Components
```
src/lib/bestauth/
  ├── auth.ts              # Core auth functions (signin, signup, OAuth)
  ├── db.ts                # Database client with connection handling
  ├── middleware.ts        # Route protection middleware
  ├── session.ts           # JWT session management
  ├── config.ts            # Configuration and types
  └── schema/              # Migration scripts (completed)
```

#### Client Integration
```typescript
// Use the BestAuth hook
import { useBestAuth } from '@/lib/bestauth/react'

function Component() {
  const { user, signIn, signOut, loading } = useBestAuth()
  
  // All auth operations available
  await signIn(email, password)
  await signOut()
}
```

### Unified Auth Strategy (Dual-System Support)

#### Auth Adapter Pattern
We use an adapter pattern to support both BestAuth (primary) and Supabase (fallback):

```typescript
// Unified auth service handles both systems
const authService = new UnifiedAuthService()
await authService.signIn(email, password) // Tries BestAuth first, falls back to Supabase
```

#### Session Management
Sessions are unified across both systems:
- BestAuth sessions use JWT tokens in httpOnly cookies
- Supabase sessions maintained for backward compatibility
- Unified session type for API routes and middleware

#### API Protection
All API routes use unified authentication:
```typescript
// Protected API route
export const GET = withAuth(async (req, session) => {
  // session.provider tells you which auth system
  // session.userId works for both systems
})
```

### Integration Checklist

#### Phase 1: Core Integration ✅
- [x] BestAuth library implementation
- [x] Database migration and schema
- [x] React hooks for client-side auth
- [x] Basic API routes

#### Phase 2: UI Components 🚧
- [ ] SignIn/SignUp forms with BestAuth
- [ ] Main navigation auth state
- [ ] Protected route wrapper
- [ ] OAuth provider buttons

#### Phase 3: Service Integration 📋
- [ ] Generation service auth validation
- [ ] Payment webhook user lookup
- [ ] Subscription management
- [ ] Usage tracking and limits

#### Phase 4: Full Migration 📋
- [ ] Email templates for BestAuth
- [ ] Password reset flow
- [ ] Magic link implementation
- [ ] User migration scripts

### Key Files to Update

1. **Navigation Components**
   - Update to use `useBestAuth` hook
   - Replace Supabase session checks

2. **API Routes**
   - Add unified auth middleware
   - Update user ID references

3. **Payment Integration**
   - Update Stripe webhooks
   - Map BestAuth users to customers

4. **Generation Service**
   - Validate BestAuth sessions
   - Track usage with BestAuth user IDs

### Development Commands

```bash
# Run BestAuth tests
npm run test:bestauth

# Check BestAuth database connection
npm run bestauth:db:check

# Run migration status check
npm run bestauth:migration:status
```

### Environment Variables
Ensure these are set for BestAuth:
```
BESTAUTH_DATABASE_URL=postgresql://...
BESTAUTH_JWT_SECRET=your-secret-key
BESTAUTH_GOOGLE_CLIENT_ID=...
BESTAUTH_GOOGLE_CLIENT_SECRET=...
```

### Important Notes
- BestAuth is the primary auth system going forward
- Supabase Auth remains only as a fallback
- All new features should use BestAuth
- User IDs may differ between systems - use mapping table
- Test both auth flows during development

## Copyright Validation (Re-enabled 2025-10-08)

### Overview
Google Vision API is now **ACTIVE** and validates all uploaded images for:
- **Face detection** - Blocks images with identifiable people (Sora policy requirement)
- **Logo detection** - Blocks images with brand logos/trademarks
- **Watermark detection** - Blocks stock photos with copyright marks

### Validation Points
1. **Upload endpoint** (`/api/sora/upload-image`) - Early detection immediately after upload
2. **Create endpoint** (`/api/sora/create`) - Final check before Sora API call

### Critical Configuration
Both endpoints require Node.js runtime (not Edge) for @google-cloud/vision compatibility:
```typescript
export const runtime = 'nodejs'
```

### Environment Variables
```bash
GOOGLE_CLOUD_VISION_API_KEY=AIzaSy...  # Required
VALIDATION_ENABLED=true
VALIDATION_LAYER_COPYRIGHT=true
VALIDATION_FACE_CONFIDENCE=0.7  # Threshold for face detection
```

### Error Response
When validation fails, API returns:
```json
{
  "error": "Image contains people or faces",
  "details": "Detected 2 people with 87% confidence",
  "suggestion": "Use landscape/nature photos without people...",
  "code": "COPYRIGHT_FACE_DETECTED",
  "validationFailed": true
}
```

### Documentation
See `COPYRIGHT_VALIDATION_ENABLED.md` for complete implementation details, testing, and troubleshooting.