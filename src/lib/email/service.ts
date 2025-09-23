import { getEmailConfig } from './config'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

class EmailService {
  private config = getEmailConfig()
  
  async send(options: EmailOptions): Promise<EmailResult> {
    const { provider } = this.config
    
    try {
      switch (provider) {
        case 'resend':
          return await this.sendWithResend(options)
        case 'sendgrid':
          return await this.sendWithSendGrid(options)
        case 'smtp':
          return await this.sendWithSMTP(options)
        case 'console':
        default:
          return await this.sendWithConsole(options)
      }
    } catch (error: any) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email'
      }
    }
  }
  
  private async sendWithResend(options: EmailOptions): Promise<EmailResult> {
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
  
  private async sendWithSendGrid(options: EmailOptions): Promise<EmailResult> {
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY not configured')
    }
    
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: options.to }]
          }],
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
  
  private async sendWithSMTP(options: EmailOptions): Promise<EmailResult> {
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
      const transporter: Transporter = nodemailer.createTransporter({
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
        replyTo: this.config.replyTo || this.config.from
      })
      
      return {
        success: true,
        messageId: info.messageId
      }
    } catch (error: any) {
      throw new Error(`SMTP error: ${error.message}`)
    }
  }
  
  private async sendWithConsole(options: EmailOptions): Promise<EmailResult> {
    // In development, just log the email
    console.log('\n📧 Email Service (Console Mode)')
    console.log('================================')
    console.log(`From: ${this.config.from}`)
    console.log(`To: ${options.to}`)
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