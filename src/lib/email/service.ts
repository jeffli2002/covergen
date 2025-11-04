import { getEmailConfig } from './config'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

export type EmailCategory =
  | 'general'
  | 'verification'
  | 'subscription'
  | 'payment_failure'
  | 'credits_exhausted'
  | 'bug_report'

export interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
  bcc?: string | string[]
  category?: EmailCategory
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

const CATEGORY_ENV_KEYS: Record<EmailCategory, string[]> = {
  general: ['EMAIL_BCC_DEFAULT', 'EMAIL_MONITOR_BCC'],
  verification: ['EMAIL_BCC_VERIFICATION', 'EMAIL_BCC_DEFAULT', 'EMAIL_MONITOR_BCC'],
  subscription: ['EMAIL_BCC_SUBSCRIPTION', 'EMAIL_BCC_DEFAULT', 'EMAIL_MONITOR_BCC'],
  payment_failure: ['EMAIL_BCC_PAYMENT_FAILURE', 'EMAIL_BCC_DEFAULT', 'EMAIL_MONITOR_BCC'],
  credits_exhausted: ['EMAIL_BCC_CREDITS_EXHAUSTED', 'EMAIL_BCC_DEFAULT', 'EMAIL_MONITOR_BCC'],
  bug_report: ['EMAIL_BCC_BUGS', 'EMAIL_BCC_DEFAULT', 'EMAIL_MONITOR_BCC']
}

const SUBJECT_CATEGORY_HINTS: Array<{ pattern: RegExp; category: EmailCategory }> = [
  { pattern: /subscription/i, category: 'subscription' },
  { pattern: /payment.*(failed|failure|issue)/i, category: 'payment_failure' },
  { pattern: /(credit|credits).*(exhaust|deplet|low|limit)/i, category: 'credits_exhausted' },
  { pattern: /(bug|incident|issue|error)/i, category: 'bug_report' }
]

class EmailService {
  private get config() {
    return getEmailConfig()
  }
  
  async send(options: EmailOptions): Promise<EmailResult> {
    const { provider } = this.config
    const normalizedOptions = this.applyMonitoredBcc(options)
    
    try {
      switch (provider) {
        case 'resend':
          return await this.sendWithResend(normalizedOptions)
        case 'sendgrid':
          return await this.sendWithSendGrid(normalizedOptions)
        case 'smtp':
          return await this.sendWithSMTP(normalizedOptions)
        case 'console':
        default:
          return await this.sendWithConsole(normalizedOptions)
      }
    } catch (error: any) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email'
      }
    }
  }
  
  private applyMonitoredBcc(options: EmailOptions): EmailOptions & { bcc?: string[] } {
    const explicitBcc = normalizeAddressInput(options.bcc)
    const category = options.category ?? detectCategoryFromSubject(options.subject) ?? 'general'
    const monitorBcc = getMonitorBcc(category)
    const combined = dedupeAddresses([...explicitBcc, ...monitorBcc])
    
    return {
      ...options,
      bcc: combined.length ? combined : undefined
    }
  }
  
  private async sendWithResend(options: EmailOptions & { bcc?: string[] }): Promise<EmailResult> {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }
    
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: this.config.from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          bcc: options.bcc,
          reply_to: this.config.replyTo
        })
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Resend API error: ${error}`)
      }
      
      const data = await response.json()
      
      return {
        success: true,
        messageId: data.id
      }
    } catch (error: any) {
      throw new Error(`Resend error: ${error.message}`)
    }
  }
  
  private async sendWithSendGrid(options: EmailOptions & { bcc?: string[] }): Promise<EmailResult> {
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY not configured')
    }
    
    try {
      const personalizations: Array<Record<string, unknown>> = [{
        to: [{ email: options.to }]
      }]
      
      if (options.bcc?.length) {
        personalizations[0].bcc = options.bcc.map(email => ({ email }))
      }
      
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations,
          from: { email: this.config.from },
          reply_to: { email: this.config.replyTo || this.config.from },
          subject: options.subject,
          content: [
            ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
            ...(options.html ? [{ type: 'text/html', value: options.html }] : [])
          ]
        })
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`SendGrid API error: ${error}`)
      }
      
      return {
        success: true,
        messageId: response.headers.get('x-message-id') || undefined
      }
    } catch (error: any) {
      throw new Error(`SendGrid error: ${error.message}`)
    }
  }
  
  private async sendWithSMTP(options: EmailOptions & { bcc?: string[] }): Promise<EmailResult> {
    const host = process.env.EMAIL_SERVER_HOST
    const port = parseInt(process.env.EMAIL_SERVER_PORT || '587')
    const user = process.env.EMAIL_SERVER_USER
    const pass = process.env.EMAIL_SERVER_PASSWORD
    const secure = process.env.EMAIL_SERVER_SECURE === 'true'
    
    if (!host || !user || !pass) {
      throw new Error('SMTP configuration incomplete. Required: EMAIL_SERVER_HOST, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD')
    }
    
    try {
      // Create transporter with Zoho Mail settings
      const transporter: Transporter = nodemailer.createTransport({
        host,
        port,
        secure, // true for 465, false for other ports
        auth: {
          user,
          pass
        },
        // Additional settings for better compatibility
        tls: {
          // Do not fail on invalid certs
          rejectUnauthorized: false
        }
      })
      
      // Verify connection
      await transporter.verify()
      
      // Send email
      const info = await transporter.sendMail({
        from: this.config.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: this.config.replyTo || this.config.from,
        bcc: options.bcc
      })
      
      return {
        success: true,
        messageId: info.messageId
      }
    } catch (error: any) {
      throw new Error(`SMTP error: ${error.message}`)
    }
  }
  
  private async sendWithConsole(options: EmailOptions & { bcc?: string[] }): Promise<EmailResult> {
    // In development, just log the email
    console.log('\n📧 Email Service (Console Mode)')
    console.log('================================')
    console.log(`From: ${this.config.from}`)
    console.log(`To: ${options.to}`)
    if (options.bcc?.length) {
      console.log(`BCC: ${options.bcc.join(', ')}`)
    }
    console.log(`Subject: ${options.subject}`)
    console.log('--------------------------------')
    if (options.text) {
      console.log('Text Content:')
      console.log(options.text)
    }
    if (options.html) {
      console.log('\nHTML Content:')
      console.log(options.html)
    }
    console.log('================================\n')
    
    return {
      success: true,
      messageId: `console-${Date.now()}`
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()

function normalizeAddressInput(addresses?: string | string[]): string[] {
  if (!addresses) return []
  const list = Array.isArray(addresses) ? addresses : addresses.split(',')
  return list
    .map(address => address.trim())
    .filter(Boolean)
}

function dedupeAddresses(addresses: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const address of addresses) {
    const normalized = address.toLowerCase()
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(address)
  }
  return result
}

function detectCategoryFromSubject(subject?: string): EmailCategory | undefined {
  if (!subject) return undefined
  const hint = SUBJECT_CATEGORY_HINTS.find(({ pattern }) => pattern.test(subject))
  return hint?.category
}

function getMonitorBcc(category: EmailCategory): string[] {
  const envKeys = CATEGORY_ENV_KEYS[category] || []
  const addresses = envKeys.flatMap(key => normalizeAddressInput(process.env[key]))
  return dedupeAddresses(addresses)
}
