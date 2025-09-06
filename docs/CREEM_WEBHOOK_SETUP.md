# Creem Webhook Configuration Guide

This guide explains how to configure the webhook endpoint in your Creem dashboard for the unified payment system.

## Webhook Endpoint URL

### Production URL
```
https://[YOUR-DOMAIN]/api/webhooks/creem-unified
```

Replace `[YOUR-DOMAIN]` with your actual production domain, for example:
- `https://coverimage.app/api/webhooks/creem-unified`
- `https://your-app.vercel.app/api/webhooks/creem-unified`
- `https://app.yourdomain.com/api/webhooks/creem-unified`

### Local Development URL (using ngrok)
```
https://[NGROK-ID].ngrok.io/api/webhooks/creem-unified
```

## Configuration Steps

### 1. Access Creem Dashboard
1. Log in to your Creem dashboard at https://dashboard.creem.io
2. Navigate to **Settings** → **Webhooks**

### 2. Create New Webhook Endpoint
1. Click **Add Endpoint**
2. Enter your webhook URL (see above)
3. Select the following events to listen for:
   - `checkout.completed` - When a customer completes checkout
   - `subscription.active` - When a subscription becomes active
   - `subscription.update` - When subscription details change
   - `subscription.paid` - When a subscription payment succeeds
   - `subscription.canceled` - When a subscription is canceled
   - `subscription.expired` - When a subscription expires
   - `payment.failed` - When a payment fails

### 3. Configure Webhook Settings
1. **Signing Secret**: Copy the webhook signing secret
2. **Add to Environment**: Save the signing secret as `CREEM_WEBHOOK_SECRET` in your environment variables
3. **Enable Webhook**: Toggle the webhook to "Active"

### 4. Test the Webhook
1. Use Creem's test webhook feature to send a test event
2. Check your application logs for the webhook processing
3. Verify the response status is 200 OK

## Environment Variables Required

Make sure these environment variables are set in your production environment:

```env
CREEM_API_KEY=your_creem_api_key
CREEM_WEBHOOK_SECRET=your_webhook_signing_secret
```

## Webhook Security Features

The unified webhook endpoint includes:
- **Signature Verification**: All requests are validated using the Creem webhook signature
- **Customer Mapping Validation**: Ensures the customer exists in your database
- **Session Context Validation**: Maintains user session continuity
- **Idempotent Processing**: Prevents duplicate event processing
- **Comprehensive Logging**: All webhook events are logged with unique IDs

## Debugging Tips

1. **Check Logs**: Look for webhook logs with pattern `[Webhook:wh_xxx]`
2. **Verify Signature**: Ensure `CREEM_WEBHOOK_SECRET` matches the dashboard value
3. **Customer Mapping**: Confirm customer mappings exist in the `customer_mapping` table
4. **Test Mode**: Use Creem's test mode for development testing

## Common Issues

### Invalid Signature (401 Error)
- Verify the `CREEM_WEBHOOK_SECRET` environment variable
- Ensure no extra spaces or characters in the secret
- Check that the webhook URL exactly matches what's configured

### Customer Mapping Not Found (400 Error)
- Ensure checkout flow creates customer mapping before payment
- Verify the customer ID in the webhook matches your database

### Database Processing Failed (500 Error)
- Check database connectivity
- Verify the `handle_subscription_webhook` function exists
- Review database migration status

## Testing Locally with ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `npm run dev`
3. Expose local server: `ngrok http 3000`
4. Copy the HTTPS URL and add `/api/webhooks/creem-unified`
5. Configure this URL in Creem dashboard for testing

## Production Checklist

- [ ] Production domain configured in Creem dashboard
- [ ] Environment variables set (CREEM_API_KEY, CREEM_WEBHOOK_SECRET)
- [ ] Database migrations applied (customer_mapping table)
- [ ] Webhook endpoint tested with real checkout flow
- [ ] Monitoring/alerting configured for webhook failures
- [ ] SSL certificate valid for production domain