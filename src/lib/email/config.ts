// Email service configuration for BestAuth
export interface EmailConfig {
  from: string
  replyTo?: string
  provider: 'resend' | 'sendgrid' | 'smtp' | 'console'
}

export function getEmailConfig(): EmailConfig {
  const emailFrom = process.env.EMAIL_FROM || 'noreply@covergen.pro'
  const emailReplyTo = process.env.EMAIL_REPLY_TO || 'support@covergen.pro'
  
  // Determine which email provider to use based on available env vars
  let provider: EmailConfig['provider'] = 'console' // Default to console logging
  
  if (process.env.RESEND_API_KEY) {
    provider = 'resend'
  } else if (process.env.SENDGRID_API_KEY) {
    provider = 'sendgrid'
  } else if (process.env.EMAIL_SERVER_HOST) {
    provider = 'smtp'
  }
  
  // In development, only use console if explicitly forced or no provider configured
  if (process.env.NODE_ENV === 'development' && 
      process.env.FORCE_EMAIL_PROVIDER === 'console' && 
      provider !== 'console') {
    console.warn('⚠️  Email provider configured but FORCE_EMAIL_PROVIDER=console is set. Using console mode.')
    provider = 'console'
  }
  
  // Log the email configuration for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`📧 Email Configuration: provider=${provider}, from=${emailFrom}`)
  }
  
  return {
    from: emailFrom,
    replyTo: emailReplyTo,
    provider
  }
}