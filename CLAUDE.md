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

## Google OAuth Implementation Learning

### Problem: Multiple GoTrueClient Instances Warning
When implementing Google OAuth with Supabase in Next.js, you may encounter the warning "Multiple GoTrueClient instances detected in the same browser context". This happens when:

1. **Mixing OAuth flows**: Using both implicit flow (tokens in URL hash) and PKCE flow (server-side code exchange)
2. **Multiple client instances**: Creating Supabase clients in different ways across the codebase
3. **SSR complications**: Complex SSR client setup conflicting with OAuth callbacks

### Solution: Use a Single, Simple Supabase Client with PKCE Flow

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

4. **Remove conflicting components**:
   - Remove OAuthHashHandler (for implicit flow)
   - Remove complex SSR client usage in OAuth-related code

### Key Takeaways

1. **Consistency is crucial**: Pick ONE OAuth flow (PKCE recommended) and stick to it
2. **Simplify client creation**: Use a single, simple Supabase client for OAuth flows
3. **Debug systematically**: Use debugging tools to identify mixed flows before making changes
4. **Type safety**: Always add TypeScript annotations for Supabase callbacks to catch errors early

### Common Pitfalls to Avoid

- Don't mix `@supabase/supabase-js` and `@supabase/ssr` clients for OAuth
- Don't use implicit flow components with PKCE configuration
- Don't create multiple Supabase client instances in different files
- Always match redirect URLs exactly in Supabase dashboard

This approach ensures a clean, working Google OAuth implementation that can be adapted for other OAuth providers supported by Supabase.