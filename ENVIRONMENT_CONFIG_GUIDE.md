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