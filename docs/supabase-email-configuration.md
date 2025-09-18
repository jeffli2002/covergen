# Supabase Email Configuration Guide

## Customizing Email Sender for Your Project

### 1. **Basic Email Customization (Supabase Dashboard)**

Go to your Supabase Dashboard:
1. Navigate to **Authentication** → **Email Templates**
2. You can customize:
   - Email subject lines
   - Email body content
   - Sender name (limited in free tier)

### 2. **Email Sender Options**

#### **Option A: Free Tier (Default)**
- **From Email**: `noreply@mail.app.supabase.io`
- **From Name**: Can be customized (e.g., "CoverGen Pro")
- **Limitations**: Cannot change the sender domain

#### **Option B: Custom SMTP (Recommended for Production)**
Configure your own email service for full control:

1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Enable "Custom SMTP"
4. Configure with your email service:

```yaml
# Example with SendGrid
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: your-sendgrid-api-key
Sender Email: noreply@covergen.pro
Sender Name: CoverGen Pro
```

```yaml
# Example with Gmail (for testing)
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: your-app-specific-password
Sender Email: your-email@gmail.com
Sender Name: CoverGen Pro
```

#### **Option C: Email Service Providers**
Popular options for production:
- **SendGrid** - 100 emails/day free
- **Resend** - 3,000 emails/month free
- **Amazon SES** - $0.10 per 1,000 emails
- **Postmark** - 100 emails/month free

### 3. **Step-by-Step: Configure Custom Email Templates**

1. **Go to Email Templates**:
   - Dashboard → Authentication → Email Templates

2. **Customize Confirmation Email**:
   ```html
   <h2>Welcome to CoverGen Pro!</h2>
   <p>Hi {{ .Email }},</p>
   <p>Thanks for signing up! Please confirm your email address by clicking the button below:</p>
   <p><a href="{{ .ConfirmationURL }}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirm Email</a></p>
   <p>This link will expire in 24 hours.</p>
   <p>Best regards,<br>The CoverGen Pro Team</p>
   ```

3. **Update Subject Line**:
   - Change from: "Confirm Your Email"
   - To: "Welcome to CoverGen Pro - Please Confirm Your Email"

### 4. **Setting Up SendGrid (Recommended)**

1. **Create SendGrid Account**:
   - Sign up at https://sendgrid.com/
   - Verify your sender domain

2. **Generate API Key**:
   - Settings → API Keys → Create API Key
   - Choose "Restricted Access"
   - Enable "Mail Send" permission

3. **Configure in Supabase**:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: SG.xxxxx (your API key)
   Sender Email: hello@covergen.pro
   Sender Name: CoverGen Pro
   ```

### 5. **Email Template Variables**

Available variables for customization:
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Confirmation link
- `{{ .SiteURL }}` - Your site URL
- `{{ .RedirectTo }}` - Redirect URL after confirmation

### 6. **Testing Email Configuration**

```typescript
// Test email sending
async function testEmailConfig() {
  const { error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'test123456',
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`
    }
  })
  
  if (error) {
    console.error('Email test failed:', error)
  } else {
    console.log('Test email sent! Check inbox.')
  }
}
```

### 7. **Email Branding Checklist**

- [ ] Custom sender name (e.g., "CoverGen Pro")
- [ ] Custom email domain (requires SMTP)
- [ ] Branded email templates
- [ ] Logo in email header
- [ ] Consistent color scheme
- [ ] Footer with contact info
- [ ] Unsubscribe link (if sending marketing emails)

### 8. **Important Notes**

1. **SPF/DKIM Records**: If using custom domain, add these DNS records to avoid spam filters
2. **Rate Limits**: Be aware of your email provider's sending limits
3. **Compliance**: Include required legal text (privacy policy, terms of service)
4. **Testing**: Always test emails in multiple clients (Gmail, Outlook, Apple Mail)

### 9. **Quick Setup for Development**

For immediate improvement without custom SMTP:
1. Go to Authentication → Email Templates
2. Change the sender name in each template from "Supabase" to "CoverGen Pro"
3. Customize email content to match your brand
4. Save changes

The emails will still come from `noreply@mail.app.supabase.io` but will show "CoverGen Pro" as the sender name in most email clients.