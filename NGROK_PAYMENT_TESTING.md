# Ngrok Payment Testing Guide

## Quick Setup

### 1. Start Your Dev Server
```bash
npm run dev
# Server runs on http://localhost:3001
```

### 2. Start Ngrok Tunnel
```bash
# In a new terminal
ngrok http 3001
```

You'll see output like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3001
```

### 3. Update Environment Variables

Add to your `.env.local`:
```bash
# Replace with your ngrok URL (changes each time you restart ngrok)
NEXT_PUBLIC_SITE_URL=https://abc123.ngrok-free.app
NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app

# Creem webhook URL for testing
# Configure this in Creem dashboard
CREEM_WEBHOOK_URL=https://abc123.ngrok-free.app/api/webhooks/creem
```

### 4. Restart Your Dev Server
```bash
# Ctrl+C to stop
npm run dev
```

### 5. Configure Creem Webhook

1. Go to Creem dashboard: https://dashboard.creem.io/webhooks
2. Add webhook endpoint: `https://abc123.ngrok-free.app/api/webhooks/creem`
3. Select events:
   - `checkout.session.completed`
   - `subscription.created`
   - `subscription.updated`
   - `payment.succeeded`
4. Copy the webhook signing secret
5. Update `.env.local`:
   ```bash
   CREEM_WEBHOOK_SECRET=whsec_xxxxx
   SKIP_WEBHOOK_SIGNATURE=false  # Enable signature verification
   ```

### 6. Test Payment Flow

1. **Visit your ngrok URL**:
   ```
   https://abc123.ngrok-free.app/en/pricing
   ```

2. **Click "Buy Now" on a credit pack**
   - Should redirect to Creem checkout
   - Use Creem test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

3. **Complete Payment**
   - Creem will redirect back to your ngrok URL
   - Webhook will be called automatically
   - Credits should be added to your account

4. **Verify Credits**
   - Check header for points balance
   - Or visit: `https://abc123.ngrok-free.app/en/account`

## Monitoring Webhooks

### View Ngrok Web Interface
```bash
# Visit in browser
http://localhost:4040
```

This shows all HTTP requests to your ngrok tunnel, including:
- Webhook POST requests from Creem
- Request/response bodies
- Headers and timing

### Check Server Logs
```bash
# In your dev server terminal, look for:
[Creem Webhook] Received event: checkout.session.completed
[Creem Webhook] Successfully granted X points
```

## Troubleshooting

### Issue: Ngrok URL Changes Every Restart
**Solution**: Use a static domain (requires ngrok paid plan) OR update webhook URL in Creem dashboard each time

**Alternative**: Use ngrok config for reserved domain:
```bash
ngrok http 3001 --domain=your-reserved-domain.ngrok-free.app
```

### Issue: Webhook Signature Verification Fails
**Check**:
1. `CREEM_WEBHOOK_SECRET` matches Creem dashboard
2. `SKIP_WEBHOOK_SIGNATURE` is set to `false`
3. Clock sync is correct (webhooks expire after 5 minutes)

**Debug**:
```bash
# Temporarily disable signature check
SKIP_WEBHOOK_SIGNATURE=true
```

### Issue: Can't Access Ngrok URL
**Check**:
1. Ngrok is running in separate terminal
2. Dev server is running on port 3001
3. Firewall isn't blocking ngrok

### Issue: OAuth Redirect Failing
**Update** Google OAuth settings:
1. Go to Google Cloud Console
2. Add to authorized redirect URIs:
   ```
   https://abc123.ngrok-free.app/auth/callback
   ```

## Testing Checklist

- [ ] Ngrok tunnel running
- [ ] Dev server running on 3001
- [ ] Environment variables updated with ngrok URL
- [ ] Creem webhook configured
- [ ] Webhook secret added to .env.local
- [ ] Can access site via ngrok URL
- [ ] Can sign in via ngrok URL
- [ ] Can view pricing page
- [ ] Can click "Buy Now"
- [ ] Redirects to Creem checkout
- [ ] Can complete test payment
- [ ] Redirects back to site
- [ ] Webhook received (check ngrok inspector)
- [ ] Credits added to account
- [ ] Points balance updates in header

## Ngrok Commands Reference

```bash
# Start tunnel
ngrok http 3001

# Start with custom subdomain (requires paid plan)
ngrok http 3001 --subdomain=my-app

# Start with reserved domain
ngrok http 3001 --domain=my-app.ngrok-free.app

# View help
ngrok help

# View version
ngrok version

# Configure auth token (first time only)
ngrok authtoken YOUR_AUTH_TOKEN
```

## Security Notes

1. **Never commit ngrok URLs** - They're temporary
2. **Use test mode for Creem** - Don't process real payments in dev
3. **Don't share ngrok URLs publicly** - Anyone can access them
4. **Verify webhook signatures** - Prevent unauthorized webhook calls
5. **Use HTTPS only** - Ngrok provides this automatically

## Cost Optimization

### Free Tier Limitations
- URL changes on each restart
- 1 online ngrok process
- Limited to 40 connections/minute

### When to Upgrade
- Need static domain
- Multiple simultaneous tunnels
- Higher rate limits
- Custom branded domains

## Alternative: LocalTunnel

If ngrok doesn't work, try localtunnel:
```bash
# Install
npm install -g localtunnel

# Start tunnel
lt --port 3001 --subdomain my-app

# Output: https://my-app.loca.lt
```

## Next Steps

After testing locally:
1. Deploy to staging environment
2. Configure production webhook URL
3. Switch Creem to live mode
4. Test with real payment (small amount)
5. Monitor production webhooks
