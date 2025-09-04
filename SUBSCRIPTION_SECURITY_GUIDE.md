# Subscription Security Guide for CoverImage

## Current Implementation Decision

For immediate stability and to match VideoTutor's working implementation, we're using the **standard Supabase client with security enhancements**. This provides:

1. **Proven reliability** - Works like VideoTutor
2. **Good security** with PKCE OAuth flow
3. **Simple to debug and maintain**
4. **Server-side validation** for all subscription features

## Security Best Practices for Subscription Features

### 1. **Never Trust Client-Side Subscription Checks**

```typescript
// ❌ BAD - Client-side only
if (user.subscription?.tier === 'pro') {
  showPremiumFeature()
}

// ✅ GOOD - Server-side validation
const isValid = await fetch('/api/auth/validate-subscription').then(r => r.json())
if (isValid) {
  showPremiumFeature()
}
```

### 2. **Protect API Routes**

All generation endpoints should validate subscription server-side:

```typescript
// In your API route
export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Validate subscription
  const subscription = await validateUserSubscription(user.id)
  if (!subscription.canGenerate) {
    return NextResponse.json({ error: 'Subscription limit reached' }, { status: 403 })
  }
  
  // Process generation...
}
```

### 3. **Webhook Security**

For payment webhooks (Stripe/Creem):

```typescript
// Verify webhook signature
const sig = req.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)

// Always update database from webhook, never from client
```

### 4. **Rate Limiting**

Implement server-side rate limiting:

```typescript
// Use Redis or database-backed rate limiting
const limit = await checkRateLimit(user.id, subscription.tier)
if (limit.exceeded) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
```

### 5. **Session Security**

Current implementation uses:
- PKCE flow for OAuth (more secure)
- Auto-refresh tokens
- 7-day session expiry

### 6. **Database Security**

Ensure RLS policies:

```sql
-- Only users can see their own subscriptions
CREATE POLICY "Users can view own subscription"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Only backend can modify subscriptions
CREATE POLICY "Only service role can modify subscriptions"
ON subscriptions FOR ALL
USING (auth.role() = 'service_role');
```

### 7. **Frontend Security**

- Disable features UI-side based on subscription
- But always validate server-side before processing
- Show clear error messages for subscription limits

## Migration Path (Future)

When you want to migrate to SSR for better security:

1. Fix cookie handling issues first
2. Implement proper server/client separation
3. Test thoroughly with OAuth providers
4. Gradually migrate features

## Current Action Items

1. **Use the enhanced browser client** (already implemented)
2. **Always validate subscriptions server-side**
3. **Implement rate limiting on API routes**
4. **Secure webhook endpoints**
5. **Monitor for suspicious activity**

## Testing Checklist

- [ ] OAuth login works reliably
- [ ] Session persists across page reloads
- [ ] Subscription limits enforced server-side
- [ ] API routes protected
- [ ] Webhooks update subscriptions correctly
- [ ] Rate limiting prevents abuse