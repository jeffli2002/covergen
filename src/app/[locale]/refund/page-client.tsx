'use client'

import { CreditCard, Clock, CheckCircle2, XCircle, AlertCircle, Mail, Shield, HelpCircle } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import { getClientSubscriptionConfig, getTrialPeriodFullText, isTrialEnabledClient } from '@/lib/subscription-config-client'

interface RefundPageClientProps {
  locale: Locale
  translations: any
}

export default function RefundPageClient({ locale, translations: t }: RefundPageClientProps) {
  const config = getClientSubscriptionConfig()
  const trialFullText = getTrialPeriodFullText()
  const hasTrials = isTrialEnabledClient()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            All sales are final.
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Policy</h2>
            <p className="text-gray-700">All sales are final. We do not offer refunds.</p>
          </section>
        </div>
      </div>
    </div>
  )
}