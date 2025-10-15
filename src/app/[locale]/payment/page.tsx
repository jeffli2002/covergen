import ClientBoundary from '@/components/client-boundary'

import { Metadata } from 'next'
import PaymentPageClient from './page-client'

export const metadata: Metadata = {
  title: 'Choose Your Plan - CoverGen AI',
  description: 'Select the perfect subscription plan for your cover generation needs. Start free or upgrade to Pro for more features.',
  keywords: [
    'pricing plans',
    'subscription',
    'pro plan',
    'free plan',
    'cover generator pricing',
    'upgrade plan',
    'payment options',
    'subscription tiers',
    'sora 2 pricing',
    'sora 2 plans',
    'sora 2 subscription',
    'ai cover pricing'
  ],
  openGraph: {
    title: 'CoverGen AI Pricing - Choose Your Plan',
    description: 'Flexible pricing plans for every creator. Start free or go Pro.',
    images: ['/pricing-og.jpg'],
  },
}

interface PaymentPageProps {
  params: {
    locale: string
  }
  searchParams: {
    plan?: string
    billing?: string
    upgrade?: string
    activate?: string
    redirect?: string
  }
}

export default function PaymentPage({ params, searchParams }: PaymentPageProps) {
  return (
    <ClientBoundary>
      <PaymentPageClient 
    locale={params.locale} 
    initialPlan={searchParams.plan}
    initialBilling={searchParams.billing as 'monthly' | 'yearly' | undefined}
    isUpgrade={searchParams.upgrade === 'true'}
    isActivation={searchParams.activate === 'true'}
    redirectUrl={searchParams.redirect}
  />
    </ClientBoundary>
  )
}