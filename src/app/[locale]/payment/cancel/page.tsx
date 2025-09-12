import ClientBoundary from '@/components/client-boundary'

import { Metadata } from 'next'
import PaymentCancelClient from './page-client'

export const metadata: Metadata = {
  title: 'Payment Cancelled - CoverGen AI',
  description: 'Your payment was cancelled. You can try again anytime.',
}

interface PaymentCancelPageProps {
  params: {
    locale: string
  }
}

export default function PaymentCancelPage({ params }: PaymentCancelPageProps) {
  return (
    <ClientBoundary>
      <PaymentCancelClient locale={params.locale} />
    </ClientBoundary>
  )
}