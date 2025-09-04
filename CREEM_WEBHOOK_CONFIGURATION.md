# Creem Webhook Configuration

## Important: Test Mode vs Production Webhooks

Creem handles webhooks differently than Stripe:

### For Test Mode Development
- **No webhook configuration needed** in Creem dashboard
- Webhooks are **simulated locally** during testing
- You can **skip webhook signature verification** in test mode

### For Production (Developers Mode)
- Webhook endpoints must be configured
- Real webhook secrets are provided
- Signature verification is required

## Update Your Configuration

Since you're in test mode, update your `.env.local`:

```env
# Creem API Configuration
CREEM_SECRET_KEY=creem_test_YOUR_API_KEY_HERE
CREEM_API_KEY=creem_test_YOUR_API_KEY_HERE

# Dummy public key (Creem doesn't use public keys)
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_test_dummy_key_for_development

# Test mode enabled
NEXT_PUBLIC_CREEM_TEST_MODE=true

# In test mode, use a dummy webhook secret or leave empty
CREEM_WEBHOOK_SECRET=whsec_test_dummy_secret
# Or simply comment it out:
# CREEM_WEBHOOK_SECRET=

# Skip webhook verification in test mode
SKIP_WEBHOOK_SIGNATURE=true

# Your product IDs
CREEM_PRO_PLAN_ID=prod_7aQWgvmz1JHGafTEGZtz9g
CREEM_PRO_PLUS_PLAN_ID=prod_3yWSn216dKFHKZJ0Z2Jrcp
```

## Test Mode Webhook Behavior

In test mode, Creem typically:
1. **Sends webhooks synchronously** after checkout completion
2. **Doesn't require signature verification**
3. **May not send webhooks at all** for some test scenarios

## Testing Without Webhooks

For initial testing, you can:
1. **Poll for subscription status** after redirect from checkout
2. **Update user status immediately** upon successful redirect
3. **Use webhooks only in production** for reliability

## Modified Webhook Handler

Update your webhook handler to skip verification in test mode:

```typescript
// In your webhook route
if (process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true' || 
    process.env.SKIP_WEBHOOK_SIGNATURE === 'true') {
  console.log('Test mode: Skipping webhook signature verification')
  // Process webhook without verification
} else {
  // Verify signature in production
  if (!creemService.verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
}
```

## Production Setup (Later)

When you're ready for production:
1. Switch to **Developers mode** in Creem
2. Add webhook endpoint: `https://yourdomain.com/api/webhooks/creem`
3. Copy the webhook secret
4. Update your production environment variables
5. Enable signature verification

## Current Action Items

1. Update your `.env.local` with the configuration above
2. Set `SKIP_WEBHOOK_SIGNATURE=true` for testing
3. Focus on getting the checkout flow working first
4. Webhooks can be properly configured when moving to production

This approach lets you test the payment flow without worrying about webhook configuration!