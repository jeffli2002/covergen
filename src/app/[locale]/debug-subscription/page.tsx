import { Metadata } from 'next'
import DebugSubscriptionPageClient from './page-client'

export const metadata: Metadata = {
  title: 'Debug Subscription - CoverGen AI',
  description: 'Debug subscription status and authentication',
}

interface DebugSubscriptionPageProps {
  params: {
    locale: string
  }
}

export default function DebugSubscriptionPage({ params }: DebugSubscriptionPageProps) {
  return <DebugSubscriptionPageClient />
}