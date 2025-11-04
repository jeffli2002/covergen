# Environment Configuration Guide

## Development vs Production Settings

### Development Environment (.env.local)
```bash
# Enable dev mode features
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_BYPASS_USAGE_LIMIT=true

# Use test payment keys
NEXT_PUBLIC_CREEM_TEST_MODE=true
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_test_xxxxx
CREEM_SECRET_KEY=sk_test_xxxxx
```

### Production Environment (.env.production)
```bash
# IMPORTANT: Disable all dev mode features
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false

# Use live payment keys
NEXT_PUBLIC_CREEM_TEST_MODE=false
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_live_xxxxx
CREEM_SECRET_KEY=sk_live_xxxxx
```

## Critical Settings to Check

1. **NEXT_PUBLIC_BYPASS_USAGE_LIMIT**: 
   - Set to `true` only in development
   - MUST be `false` in production to enforce usage limits

2. **NEXT_PUBLIC_DEV_MODE**: 
   - Controls development-only features
   - MUST be `false` in production

3. **Payment Keys**:
   - Use test keys (pk_test_*, sk_test_*) in development
   - Use live keys (pk_live_*, sk_live_*) in production
   - Never commit real keys to version control

## Deployment Checklist

Before deploying to production:
- [ ] Set `NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false`
- [ ] Set `NEXT_PUBLIC_DEV_MODE=false`
- [ ] Use production payment keys
- [ ] Verify Supabase production URL and keys
- [ ] Test subscription flow works correctly
- [ ] Verify usage limits are enforced

## Email Provider (Resend/SMTP/SendGrid)

Set the following variables in Vercel (or `.env.local` for development) so transactional emails are sent:

### Option 1: Resend (Recommended)
```bash
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro
EMAIL_BCC_SUBSCRIPTION=jefflee2002@gmail.com
EMAIL_BCC_PAYMENT_FAILURE=jefflee2002@gmail.com
EMAIL_BCC_CREDITS_EXHAUSTED=jefflee2002@gmail.com
EMAIL_BCC_BUGS=jefflee2002@gmail.com
```

### Option 2: SMTP (e.g., Zoho Mail)
```bash
EMAIL_SERVER_HOST=smtp.zoho.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro
```

### Option 3: SendGrid
```bash
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro
```

### Important Notes:
- **Emails are now sent in both development and production** if a provider is configured
- Set `FORCE_EMAIL_PROVIDER=console` if you want to disable email sending and only log to console
- Optional: Use `EMAIL_BCC_DEFAULT` or `EMAIL_MONITOR_BCC` to set a global fallback BCC list
