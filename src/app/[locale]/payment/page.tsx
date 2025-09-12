import ClientBoundary from '@/components/client-boundary'

import { Metadata } from 'next'
import PaymentPageClient from './page-client'

export const metadata: Metadata = {
  title: 'Choose Your Plan - CoverGen AI',
  description: 'Select the perfect subscription plan for your cover generation needs. Start free or upgrade to Pro for more features.',
}

interface PaymentPageProps {
  params: {
    locale: string
  }
  searchParams: {
    plan?: string
    upgrade?: string
    redirect?: string
  }
}

export default function PaymentPage({ params, searchParams }: PaymentPageProps) {
  return (
    <ClientBoundary>
      <PaymentPageClient 
    locale={params.locale} 
    initialPlan={searchParams.plan}
    isUpgrade={searchParams.upgrade === 'true'}
    redirectUrl={searchParams.redirect}
  />
    </ClientBoundary>
  )
}