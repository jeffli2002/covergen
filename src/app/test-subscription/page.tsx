'use client'

import { SubscriptionManagement } from '@/components/subscription-management'

export const dynamic = 'force-dynamic'

export default function TestSubscriptionPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Test Subscription Management</h1>
      <SubscriptionManagement />
    </div>
  )
}