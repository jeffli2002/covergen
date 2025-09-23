#!/usr/bin/env tsx
import { emailService } from '../src/lib/email/service'
import { getVerificationEmailTemplate } from '../src/lib/email/templates/verification'

async function testEmail() {
  console.log('🧪 Testing Email Configuration with BestAuth')
  console.log('==========================================')
  
  // Check environment variables
  const emailProvider = process.env.EMAIL_SERVER_HOST ? 'smtp' : 
                       process.env.RESEND_API_KEY ? 'resend' :
                       process.env.SENDGRID_API_KEY ? 'sendgrid' : 'console'
  
  console.log('\n📧 Email Configuration:')
  console.log('- Provider:', emailProvider)
  console.log('- From:', process.env.EMAIL_FROM || 'noreply@covergen.pro')
  console.log('- Reply-To:', process.env.EMAIL_REPLY_TO || 'support@covergen.pro')
  
  if (emailProvider === 'smtp') {
    console.log('\n🔧 SMTP Configuration:')
    console.log('- Host:', process.env.EMAIL_SERVER_HOST || 'Not set')
    console.log('- Port:', process.env.EMAIL_SERVER_PORT || '587')
    console.log('- User:', process.env.EMAIL_SERVER_USER || 'Not set')
    console.log('- Password:', process.env.EMAIL_SERVER_PASSWORD ? '***' : 'Not set')
    console.log('- Secure:', process.env.EMAIL_SERVER_SECURE || 'false')
  }
  
  // Get test email address
  const testEmail = process.argv[2]
  if (!testEmail) {
    console.error('\n❌ Please provide a test email address')
    console.log('Usage: npm run test:email your-email@example.com')
    process.exit(1)
  }
  
  console.log(`\n📮 Sending test email to: ${testEmail}`)
  
  try {
    // Generate test verification email
    const { html, text } = getVerificationEmailTemplate({
      email: testEmail,
      verificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/auth/verify-email?token=test-token-123`,
      name: 'Test User'
    })
    
    // Send email
    const result = await emailService.send({
      to: testEmail,
      subject: 'Test Email - CoverGen Pro Email Configuration',
      html,
      text
    })
    
    if (result.success) {
      console.log('\n✅ Email sent successfully!')
      console.log('Message ID:', result.messageId)
      console.log('\nPlease check your inbox and spam folder.')
      
      if (emailProvider === 'smtp') {
        console.log('\n💡 Zoho Mail Tips:')
        console.log('- Make sure you\'re using an app-specific password')
        console.log('- Check that SPF/DKIM records are configured for your domain')
        console.log('- Verify the sender email is added and verified in Zoho Mail')
      }
    } else {
      console.error('\n❌ Failed to send email:', result.error)
      
      if (emailProvider === 'smtp' && result.error?.includes('auth')) {
        console.log('\n🔐 Authentication Error - Common Zoho Mail Issues:')
        console.log('1. Generate an app-specific password in Zoho Mail settings')
        console.log('2. Enable two-factor authentication if not already enabled')
        console.log('3. Use the app password instead of your regular password')
        console.log('4. Make sure the email address matches your Zoho account')
      }
    }
  } catch (error: any) {
    console.error('\n❌ Error sending email:', error.message)
    
    if (error.message.includes('SMTP configuration incomplete')) {
      console.log('\n⚠️  Missing SMTP configuration. Required environment variables:')
      console.log('- EMAIL_SERVER_HOST=smtp.zoho.com')
      console.log('- EMAIL_SERVER_PORT=587')
      console.log('- EMAIL_SERVER_USER=noreply@covergen.pro')
      console.log('- EMAIL_SERVER_PASSWORD=your-app-password')
      console.log('- EMAIL_FROM=noreply@covergen.pro')
    }
  }
}

// Run the test
testEmail().catch(console.error)