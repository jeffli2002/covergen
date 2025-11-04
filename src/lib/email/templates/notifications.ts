const BRAND_COLOR = '#7C3AED'
const TEXT_COLOR = '#0F172A'
const MUTED_TEXT_COLOR = '#475569'
const BORDER_COLOR = '#E2E8F0'
const RADIUS = '16px'

interface BaseTemplateOptions {
  previewText: string
  heading: string
  intro: string
  highlightItems?: Array<{ label: string; value: string }>
  bodySections?: Array<{ title?: string; content: string }>
  cta?: {
    label: string
    url: string
  }
  footerNote?: string
}

interface TemplateResult {
  subject: string
  html: string
  text: string
}

interface SubscriptionTemplateOptions {
  userName?: string
  planName: string
  billingCycle: 'Monthly' | 'Yearly'
  creditsGranted: number
  renewalDate: string
  manageUrl: string
  invoiceUrl?: string
  supportUrl: string
}

interface PaymentFailureTemplateOptions {
  userName?: string
  planName: string
  failureReason: string
  lastAttempt: string
  retryUrl: string
  backupUrl: string
  supportUrl: string
}

interface CreditsExhaustedTemplateOptions {
  userName?: string
  planName: string
  currentCredits: number
  nextRefresh: string
  topUpUrl: string
  usageHighlights: Array<{ label: string; value: string }>
  supportUrl: string
}

interface BugReportTemplateOptions {
  userName?: string
  ticketId: string
  summary: string
  environment: string
  statusUrl: string
  supportUrl: string
}

export function getSubscriptionActivationTemplate(options: SubscriptionTemplateOptions): TemplateResult {
  const subject = `You're all set! ${options.planName} activated`
  const previewText = `Welcome to ${options.planName}. Credits granted: ${options.creditsGranted}.`
  const intro = `Hi ${options.userName ?? 'there'}, thanks for upgrading to the ${options.planName} plan. Your workspace is now unlocked with premium limits and credits.`
  
  const highlightItems = [
    { label: 'Plan', value: options.planName },
    { label: 'Billing cycle', value: options.billingCycle },
    { label: 'Credits granted', value: options.creditsGranted.toLocaleString() },
    { label: 'Renews on', value: options.renewalDate }
  ]
  
  const bodySections = [
    {
      title: 'What happens next?',
      content: `
        <ul style="padding-left: 18px; margin: 8px 0; color: ${MUTED_TEXT_COLOR};">
          <li>Your credits are already in your account — start generating right away.</li>
          <li>We'll send reminders before each renewal and if you approach your credit limit.</li>
          <li>You can pause, upgrade, or downgrade anytime from the billing dashboard.</li>
        </ul>
      `
    },
    {
      title: 'Helpful links',
      content: `
        <p style="margin: 0 0 8px;">• Manage subscription: <a href="${options.manageUrl}" style="color: ${BRAND_COLOR};">Open dashboard</a></p>
        ${options.invoiceUrl ? `<p style="margin: 0 0 8px;">• Download receipt: <a href="${options.invoiceUrl}" style="color: ${BRAND_COLOR};">View invoice</a></p>` : ''}
        <p style="margin: 0;">• Need help? Visit <a href="${options.supportUrl}" style="color: ${BRAND_COLOR};">support</a>.</p>
      `
    }
  ]
  
  const html = renderBaseTemplate({
    previewText,
    heading: 'Welcome to CoverGen Pro',
    intro,
    highlightItems,
    bodySections,
    cta: {
      label: 'Open billing dashboard',
      url: options.manageUrl
    },
    footerNote: 'Credits refresh automatically at the start of each billing cycle. You can grant access to teammates from Settings → Members.'
  })
  
  const text = [
    subject,
    '',
    intro,
    '',
    `Plan: ${options.planName}`,
    `Billing cycle: ${options.billingCycle}`,
    `Credits granted: ${options.creditsGranted.toLocaleString()}`,
    `Renews on: ${options.renewalDate}`,
    '',
    'What happens next?',
    '- Credits are active immediately.',
    '- Renewal reminders arrive before each billing date.',
    '- Manage your plan anytime from the dashboard.',
    '',
    `Manage subscription: ${options.manageUrl}`,
    options.invoiceUrl ? `Download receipt: ${options.invoiceUrl}` : '',
    `Need help? ${options.supportUrl}`
  ].filter(Boolean).join('\n')
  
  return { subject, html, text }
}

export function getPaymentFailureTemplate(options: PaymentFailureTemplateOptions): TemplateResult {
  const subject = `Action needed: payment issue on ${options.planName}`
  const previewText = `We couldn't process your ${options.planName} renewal. Update your payment method to keep generating.`
  const intro = `Hi ${options.userName ?? 'there'}, your recent renewal for the ${options.planName} plan didn't go through (${options.failureReason}).`
  
  const highlightItems = [
    { label: 'Plan', value: options.planName },
    { label: 'Last attempt', value: options.lastAttempt },
    { label: 'Status', value: 'Payment failed' }
  ]
  
  const bodySections = [
    {
      title: 'How to fix this',
      content: `
        <ol style="padding-left: 18px; margin: 8px 0; color: ${MUTED_TEXT_COLOR};">
          <li>Update your payment details using the secure link below.</li>
          <li>Retry the charge or set a different card as default.</li>
          <li>If the issue persists, add a backup payment method.</li>
        </ol>
      `
    },
    {
      title: 'Need a hand?',
      content: `
        <p style="margin: 0 0 8px;">We hold your current plan for 7 days before pausing access. Reach out if you need more time.</p>
        <p style="margin: 0;">Support: <a href="${options.supportUrl}" style="color: ${BRAND_COLOR};">${options.supportUrl}</a></p>
      `
    }
  ]
  
  const html = renderBaseTemplate({
    previewText,
    heading: 'Payment Issue Detected',
    intro,
    highlightItems,
    bodySections,
    cta: {
      label: 'Update payment method',
      url: options.retryUrl
    },
    footerNote: `You can also add a backup payment option here: ${options.backupUrl}`
  })
  
  const text = [
    subject,
    '',
    intro,
    '',
    `Plan: ${options.planName}`,
    `Last attempt: ${options.lastAttempt}`,
    '',
    'How to fix this:',
    '1. Update your payment details.',
    '2. Retry the charge.',
    '3. Add a backup payment method if needed.',
    '',
    `Update payment method: ${options.retryUrl}`,
    `Add backup card: ${options.backupUrl}`,
    `Support: ${options.supportUrl}`
  ].join('\n')
  
  return { subject, html, text }
}

export function getCreditsExhaustedTemplate(options: CreditsExhaustedTemplateOptions): TemplateResult {
  const subject = 'Heads up: you’ve used all available credits'
  const previewText = `Your ${options.planName} credits are exhausted. Top up or upgrade to keep generating.`
  const intro = `Hi ${options.userName ?? 'there'}, your team has reached the credit allotment for the ${options.planName} plan.`
  
  const highlightItems = [
    { label: 'Plan', value: options.planName },
    { label: 'Credits remaining', value: options.currentCredits.toString() },
    { label: 'Next refresh', value: options.nextRefresh }
  ]
  
  const usageDetails = options.usageHighlights.map(item => `<p style="margin: 0 0 6px; color: ${MUTED_TEXT_COLOR};">${item.label}: <strong style="color:${TEXT_COLOR};">${item.value}</strong></p>`).join('')
  
  const bodySections = [
    {
      title: 'Usage snapshot',
      content: usageDetails
    },
    {
      title: 'What you can do',
      content: `
        <ul style="padding-left: 18px; margin: 8px 0; color: ${MUTED_TEXT_COLOR};">
          <li>Purchase a one-time credit pack to finish current work.</li>
          <li>Upgrade plans if you need higher monthly limits.</li>
          <li>Wait for the automatic refresh on ${options.nextRefresh}.</li>
        </ul>
      `
    }
  ]
  
  const html = renderBaseTemplate({
    previewText,
    heading: 'Credits Exhausted',
    intro,
    highlightItems,
    bodySections,
    cta: {
      label: 'Top up credits',
      url: options.topUpUrl
    },
    footerNote: `Need help modeling your usage? Chat with us at ${options.supportUrl}`
  })
  
  const text = [
    subject,
    '',
    intro,
    '',
    `Plan: ${options.planName}`,
    `Credits remaining: ${options.currentCredits}`,
    `Next refresh: ${options.nextRefresh}`,
    '',
    'Usage snapshot:',
    ...options.usageHighlights.map(item => `- ${item.label}: ${item.value}`),
    '',
    'Options:',
    '- Buy a credit pack.',
    '- Upgrade for larger monthly limits.',
    `- Wait until ${options.nextRefresh} for the refresh.`,
    '',
    `Top up credits: ${options.topUpUrl}`,
    `Support: ${options.supportUrl}`
  ].join('\n')
  
  return { subject, html, text }
}

export function getBugReportAcknowledgementTemplate(options: BugReportTemplateOptions): TemplateResult {
  const subject = `We received your report (#${options.ticketId})`
  const previewText = `Thanks for flagging this issue. We’ll keep you posted on ticket #${options.ticketId}.`
  const intro = `Hi ${options.userName ?? 'there'}, thanks for helping us improve CoverGen. We logged your report and assigned it to the engineering queue.`
  
  const highlightItems = [
    { label: 'Ticket', value: `#${options.ticketId}` },
    { label: 'Environment', value: options.environment }
  ]
  
  const bodySections = [
    {
      title: 'Summary',
      content: `<p style="margin: 0; color: ${MUTED_TEXT_COLOR};">${options.summary}</p>`
    },
    {
      title: 'What to expect',
      content: `
        <ul style="padding-left: 18px; margin: 8px 0; color: ${MUTED_TEXT_COLOR};">
          <li>Engineers review and reproduce the issue.</li>
          <li>We’ll share progress updates on your ticket page.</li>
          <li>Once resolved, you’ll receive a final confirmation email.</li>
        </ul>
      `
    }
  ]
  
  const html = renderBaseTemplate({
    previewText,
    heading: 'Bug Report Received',
    intro,
    highlightItems,
    bodySections,
    cta: {
      label: 'Track ticket status',
      url: options.statusUrl
    },
    footerNote: `Need to add more context? Reply to this email or message us at ${options.supportUrl}`
  })
  
  const text = [
    subject,
    '',
    intro,
    '',
    `Ticket: #${options.ticketId}`,
    `Environment: ${options.environment}`,
    '',
    'Summary:',
    options.summary,
    '',
    'Track status:',
    options.statusUrl,
    '',
    `Need more help? ${options.supportUrl}`
  ].join('\n')
  
  return { subject, html, text }
}

function renderBaseTemplate(options: BaseTemplateOptions): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${options.heading}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #F8FAFC;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          color: ${TEXT_COLOR};
        }
        a { color: ${BRAND_COLOR}; text-decoration: none; }
        .card {
          background: #fff;
          border-radius: ${RADIUS};
          border: 1px solid ${BORDER_COLOR};
          padding: 32px;
          margin: 24px auto;
          max-width: 600px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        }
        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(124, 58, 237, 0.12);
          color: ${BRAND_COLOR};
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .highlights {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin: 24px 0;
        }
        .highlight-item {
          border: 1px solid ${BORDER_COLOR};
          border-radius: 12px;
          padding: 14px 16px;
          background: #F8FAFC;
        }
        .highlight-item span {
          display: block;
        }
        .title {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: ${MUTED_TEXT_COLOR};
          margin-bottom: 6px;
        }
        .value {
          font-size: 18px;
          font-weight: 600;
          color: ${TEXT_COLOR};
        }
        .cta-button {
          display: inline-block;
          background: ${BRAND_COLOR};
          color: #fff !important;
          padding: 14px 26px;
          border-radius: 999px;
          font-weight: 600;
          margin-top: 12px;
        }
        .footer {
          text-align: center;
          color: ${MUTED_TEXT_COLOR};
          font-size: 12px;
          margin-top: 24px;
        }
      </style>
    </head>
    <body>
      <span style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0;">
        ${options.previewText}
      </span>
      <div class="card">
        <div class="badge">CoverGen Pro</div>
        <h1 style="margin: 16px 0 12px; font-size: 24px;">${options.heading}</h1>
        <p style="margin: 0 0 18px; color: ${MUTED_TEXT_COLOR}; line-height: 1.5;">${options.intro}</p>
        
        ${options.highlightItems?.length ? `
          <div class="highlights">
            ${options.highlightItems.map(item => `
              <div class="highlight-item">
                <span class="title">${item.label}</span>
                <span class="value">${item.value}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${options.bodySections?.map(section => `
          <div style="margin: 24px 0;">
            ${section.title ? `<h3 style="margin: 0 0 8px;">${section.title}</h3>` : ''}
            <div style="line-height: 1.6; color: ${MUTED_TEXT_COLOR};">${section.content}</div>
          </div>
        `).join('')}
        
        ${options.cta ? `
          <a class="cta-button" href="${options.cta.url}">${options.cta.label}</a>
        ` : ''}
        
        ${options.footerNote ? `
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid ${BORDER_COLOR}; color: ${MUTED_TEXT_COLOR}; font-size: 13px;">
            ${options.footerNote}
          </div>
        ` : ''}
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} CoverGen Pro · 320 Park Ave · New York, NY<br/>
        You’re receiving this email because you have a CoverGen Pro account.
      </div>
    </body>
  </html>
  `
}
