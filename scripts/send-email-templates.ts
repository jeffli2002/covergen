#!/usr/bin/env tsx
import path from 'path'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: path.resolve(process.cwd(), '.env.local'), override: true })
loadEnv()
import { emailService } from '../src/lib/email/service'
import {
  getSubscriptionActivationTemplate,
  getPaymentFailureTemplate,
  getCreditsExhaustedTemplate,
  getBugReportAcknowledgementTemplate
} from '../src/lib/email/templates/notifications'

type Scenario = {
  name: string
  category: Parameters<typeof emailService.send>[0]['category']
  build: () => { subject: string; html: string; text: string }
}

const targetEmail = process.argv[2] || '994235892@qq.com'

async function main() {
  console.log('📧 Sending comprehensive template previews')
  console.log('Target:', targetEmail)
  console.log('Using provider:', process.env.RESEND_API_KEY ? 'Resend' : process.env.SENDGRID_API_KEY ? 'SendGrid' : 'Console')
  console.log('-------------------------------------------')
  
  const scenarios: Scenario[] = [
    {
      name: 'Subscription activation',
      category: 'subscription',
      build: () => getSubscriptionActivationTemplate({
        userName: 'Alex',
        planName: 'Pro+ Unlimited',
        billingCycle: 'Monthly',
        creditsGranted: 1600,
        renewalDate: 'December 15, 2025',
        manageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/account/billing`,
        invoiceUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/account/billing/invoices/latest`,
        supportUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/support`
      })
    },
    {
      name: 'Payment failure',
      category: 'payment_failure',
      build: () => getPaymentFailureTemplate({
        userName: 'Alex',
        planName: 'Pro+ Unlimited',
        failureReason: 'Card expired',
        lastAttempt: 'November 30, 2025 at 14:22 UTC',
        retryUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/account/billing/payment-method`,
        backupUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/account/billing/backup`,
        supportUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/support`
      })
    },
    {
      name: 'Credits exhausted',
      category: 'credits_exhausted',
      build: () => getCreditsExhaustedTemplate({
        userName: 'Alex',
        planName: 'Pro+ Unlimited',
        currentCredits: 0,
        nextRefresh: 'December 1, 2025',
        topUpUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/pricing`,
        usageHighlights: [
          { label: 'Nano Banana images', value: '380 generated' },
          { label: 'Sora 2 videos', value: '42 generated' },
          { label: 'Collaboration seats', value: '4 active teammates' }
        ],
        supportUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/support`
      })
    },
    {
      name: 'Bug report acknowledgement',
      category: 'bug_report',
      build: () => getBugReportAcknowledgementTemplate({
        userName: 'Alex',
        ticketId: 'BG-2741',
        summary: 'Uploads stall at 70% when drag-and-dropping multiple PSD files larger than 50MB.',
        environment: 'Production · Chrome 128 · Windows 11',
        statusUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/support/tickets/BG-2741`,
        supportUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/support`
      })
    }
  ]
  
  for (const scenario of scenarios) {
    const template = scenario.build()
    console.log(`\n→ Sending: ${scenario.name}`)
    
    const result = await emailService.send({
      to: targetEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      category: scenario.category
    })
    
    if (result.success) {
      console.log(`✅ Sent (${scenario.category}) messageId=${result.messageId}`)
    } else {
      console.error(`❌ Failed to send ${scenario.name}: ${result.error}`)
    }
  }
  
  console.log('\nAll scenarios processed.')
}

main().catch(error => {
  console.error('Unexpected error while sending templates:', error)
  process.exit(1)
})
