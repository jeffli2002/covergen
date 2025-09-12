import { Metadata } from 'next'
import PaymentSuccessClient from './page-client'

export const metadata: Metadata = {
  title: 'Payment Successful - CoverGen AI',
  description: 'Your subscription has been activated successfully. Start creating amazing covers!',
}

interface PaymentSuccessPageProps {
  params: {
    locale: string
  }
  searchParams: {
    session_id?: string
  }
}

export default function PaymentSuccessPage({ params, searchParams }: PaymentSuccessPageProps) {
  return (
    <ClientBoundary>
      <PaymentSuccessClient 
    locale={params.locale} 
    sessionId={searchParams.session_id}
  />
    </ClientBoundary>
  )
}