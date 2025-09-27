'use client'

import Link from 'next/link'
import { Mail, MessageSquare, FileQuestion, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Locale } from '@/lib/i18n/config'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'

interface SupportPageClientProps {
  locale: Locale
  translations: any
}

export default function SupportPageClient({ locale, translations: t }: SupportPageClientProps) {
  // Get configuration for dynamic values
  const config = getClientSubscriptionConfig()
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-hero-title text-gray-900 mb-4">
            How Can We Help You?
          </h1>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help! Choose a support option below or browse our FAQ for quick answers.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Email Support */}
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-heading-4 mb-2">Email Support</h3>
            <p className="text-body-md text-gray-600 mb-4">
              Get help via email. We typically respond within 24 hours.
            </p>
            <a
              href="mailto:support@covergen.pro"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
            >
              Send us an email
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Documentation */}
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileQuestion className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-heading-4 mb-2">Documentation</h3>
            <p className="text-body-md text-gray-600 mb-4">
              Browse our comprehensive guides and tutorials.
            </p>
            <Link
              href={`/${locale}#faq`}
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
            >
              View FAQ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-heading-4 mb-2">Feedback</h3>
            <p className="text-body-md text-gray-600 mb-4">
              Share your ideas and help us improve our service.
            </p>
            <Link
              href={`/${locale}/feedback`}
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
            >
              Send feedback
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-heading-3 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="text-heading-5 text-gray-900">What happens when I reach my limit?</h4>
              <p className="text-body-md text-gray-600 mt-1">
                Free users have {config.limits.free.daily} covers per day ({config.limits.free.monthly}/month max). Pro/Pro+ users can use their monthly quota anytime without fixed daily limits. When you reach your limit, you'll see an upgrade prompt or need to wait for the next billing cycle.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="text-heading-5 text-gray-900">How do I upgrade my subscription?</h4>
              <p className="text-body-md text-gray-600 mt-1">
                Click "Upgrade to Pro" in the limit modal or go to the pricing page. You can upgrade directly from the generation form when you hit your daily limit.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="text-heading-5 text-gray-900">Do Pro users have daily limits?</h4>
              <p className="text-body-md text-gray-600 mt-1">
                Pro ($9/month, {config.limits.pro.monthly} covers) and Pro+ ($19/month, {config.limits.pro_plus.monthly} covers) have no fixed daily limits. You can use your remaining monthly balance anytime during the billing cycle.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="text-heading-5 text-gray-900">My generated image isn't loading</h4>
              <p className="text-body-md text-gray-600 mt-1">
                Try refreshing the page or clearing your browser cache. If the issue persists, contact support.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="text-heading-5 text-gray-900">What's your refund policy?</h4>
              <p className="text-body-md text-gray-600 mt-1">
                All sales are final due to the digital nature of our service.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-body-md text-gray-600 mb-4">
            Still need help? We're just an email away.
          </p>
          <Button asChild size="lg">
            <a href="mailto:support@covergen.pro">
              Contact Support
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}