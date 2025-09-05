# Creem Payment Integration Configuration Guide

## Overview

This guide explains how to properly configure Creem payment integration for both test and production environments, avoiding common 403 Forbidden errors.

## Key Concepts

### Environment Separation

Creem enforces strict separation between test and production environments:
- **Test API keys** start with `creem_test_` and can only access test resources
- **Production API keys** start with `creem_` and can only access production resources
- **Product IDs** are different between test and production environments

### Common Error: 403 Forbidden

This error occurs when:
1. Using a test API key to access production product IDs
2. Using a production API key to access test product IDs
3. Using invalid or non-existent product IDs

## Configuration Steps

### 1. Test Environment Setup

#### Step 1: Get Test API Key
1. Log into your Creem dashboard
2. Toggle to "Test Mode" (usually in the top navigation)
3. Go to Developers section
4. Copy your test API key (starts with `creem_test_`)

#### Step 2: Create Test Products
```bash
# First, update your .env.local with test API key
CREEM_SECRET_KEY=creem_test_YOUR_TEST_KEY_HERE
NEXT_PUBLIC_CREEM_TEST_MODE=true

# Run the setup script
npm run setup:creem-test
```

This script will:
- Create test products in your Creem dashboard
- Output the test product IDs
- Show you what to add to your .env file

#### Step 3: Update Environment Variables
```env
# .env.local (for development)
CREEM_SECRET_KEY=creem_test_74IKMH2ZX1ckFe451eRfF1
CREEM_WEBHOOK_SECRET=whsec_your_test_webhook_secret
CREEM_TEST_PRO_PRODUCT_ID=prod_test_xxxxx  # From setup script output
CREEM_TEST_PRO_PLUS_PRODUCT_ID=prod_test_yyyyy  # From setup script output
NEXT_PUBLIC_CREEM_TEST_MODE=true
```

### 2. Production Environment Setup

#### Step 1: Get Production API Key
1. Log into your Creem dashboard
2. Toggle to "Production Mode"
3. Go to Developers section
4. Copy your production API key (starts with `creem_`)

#### Step 2: Create Production Products
1. In production mode, create your products manually in Creem dashboard
2. Or use the API with production credentials

#### Step 3: Update Production Environment Variables
```env
# .env.production
CREEM_SECRET_KEY=creem_YOUR_PRODUCTION_KEY_HERE
CREEM_WEBHOOK_SECRET=whsec_your_production_webhook_secret
CREEM_PROD_PRO_PRODUCT_ID=prod_7aQWgvmz1JHGafTEGZtz9g
CREEM_PROD_PRO_PLUS_PRODUCT_ID=prod_3yWSn216dKFHKZJ0Z2Jrcp
NEXT_PUBLIC_CREEM_TEST_MODE=false
```

## Environment Variable Reference

### Test Environment (.env.local)
```env
# Test API Credentials
CREEM_SECRET_KEY=creem_test_xxxxxxxxxxxx
CREEM_WEBHOOK_SECRET=whsec_test_xxxxxxxxxx

# Test Product IDs (from setup script)
CREEM_TEST_PRO_PRODUCT_ID=prod_test_pro_xxxxx
CREEM_TEST_PRO_PLUS_PRODUCT_ID=prod_test_proplus_xxxxx

# Enable test mode
NEXT_PUBLIC_CREEM_TEST_MODE=true

# Optional: Skip webhook signature in test
CREEM_SKIP_WEBHOOK_SIGNATURE=true
```

### Production Environment (.env.production)
```env
# Production API Credentials
CREEM_SECRET_KEY=creem_xxxxxxxxxxxx
CREEM_WEBHOOK_SECRET=whsec_prod_xxxxxxxxxx

# Production Product IDs
CREEM_PROD_PRO_PRODUCT_ID=prod_7aQWgvmz1JHGafTEGZtz9g
CREEM_PROD_PRO_PLUS_PRODUCT_ID=prod_3yWSn216dKFHKZJ0Z2Jrcp

# Disable test mode
NEXT_PUBLIC_CREEM_TEST_MODE=false
```

## Troubleshooting

### 403 Forbidden Error Checklist

1. **Check API Key Type**
   ```javascript
   // In your logs, look for:
   apiKeyPrefix: 'creem_test_...' // Should match your environment
   isTestKey: true/false
   expectedKeyType: 'test' or 'production'
   ```

2. **Verify Product IDs**
   - Test product IDs should be created in test mode
   - Production product IDs should be created in production mode
   - Never use production product IDs with test API keys

3. **Environment Variable Check**
   ```bash
   # Check which environment variables are set
   env | grep CREEM
   ```

4. **SDK Server Index**
   - Test mode uses serverIdx: 1
   - Production uses serverIdx: 0

### Debug Logging

The integration includes comprehensive logging:
```javascript
[Creem] Creating checkout with: {
  productId: 'prod_test_xxxxx',
  testMode: true,
  isTestKey: true,
  expectedKeyType: 'test'
}
```

If you see mismatches between `isTestKey` and `expectedKeyType`, you have an environment configuration issue.

## Testing Payments

### Test Card Numbers

Use these test card numbers in test mode:
- **Success**: 4242424242424242
- **Decline**: 4000000000000002
- **Insufficient funds**: 4000000000009995
- **3D Secure**: 4000000000003220

### Test Webhooks

1. Use ngrok or similar for local webhook testing:
   ```bash
   ngrok http 3001
   ```

2. Update webhook endpoint in Creem dashboard to ngrok URL

3. Test webhook signature verification is working

## Migration Guide

### Moving from Test to Production

1. Create products in production Creem dashboard
2. Update environment variables with production values
3. Set `NEXT_PUBLIC_CREEM_TEST_MODE=false`
4. Deploy with production configuration
5. Test with small real payment first
6. Monitor logs for any configuration errors

## Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Validate webhook signatures** - Prevent fake webhook calls
3. **Use HTTPS in production** - Required for secure payments
4. **Separate test and production** - Never mix environments
5. **Monitor for errors** - Set up alerts for 403 errors

## Support

If you continue to experience issues:
1. Check Creem dashboard for API key permissions
2. Verify products exist in the correct environment
3. Contact Creem support with specific error details