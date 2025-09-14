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
          {/* Quick Summary */}
          <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Quick Summary</h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span>All sales are final - no refunds for digital services</span>
                  </li>
                  {hasTrials && (
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Try Pro/Pro+ risk-free with our {trialFullText}</span>
                    </li>
                  )}
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Cancel anytime to prevent future charges</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Billing errors corrected within 30 days</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Digital Service Policy */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <XCircle className="w-8 h-8 text-red-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">No Refund Policy</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                CoverGen Pro is a digital service that provides immediate access to AI-powered cover generation. 
                Due to the nature of our service and the computational resources consumed:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All purchases are final and non-refundable</li>
                <li>Credits are consumed immediately upon generation</li>
                <li>Generated images cannot be "returned"</li>
                <li>Service access begins immediately upon payment</li>
              </ul>
            </div>
          </section>

          {/* Free Trial Section */}
          {hasTrials && (
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
              <div className="flex items-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Try Before You Buy</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="font-medium text-purple-700">
                  We offer a {trialFullText} for Pro and Pro+ plans!
                </p>
                <div className="bg-white rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900">During your trial:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Full access to all plan features</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Cancel anytime without being charged</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Automatic conversion to paid plan after trial ends</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Email reminder before trial expires</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Subscription Management */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <Clock className="w-8 h-8 text-blue-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Cancellation</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Cancel anytime from your account dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Access continues until end of billing period</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>No partial refunds for unused time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Unused credits expire at period end</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Billing Cycle</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Monthly subscriptions renew automatically</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Credits reset at the start of each period</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Upgrade/downgrade takes effect immediately</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Pro-rated charges for plan changes</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Exceptions */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <Shield className="w-8 h-8 text-green-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Exceptions & Corrections</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">We will issue refunds for:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span><strong>Billing Errors:</strong> Duplicate charges or incorrect amounts</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span><strong>Service Outages:</strong> Extended downtime preventing service use</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span><strong>Technical Issues:</strong> Persistent bugs preventing core functionality</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Refund requests must be submitted within 30 days of the charge. 
                  Please contact support with your order details and reason for the request.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Support */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-center mb-6">
              <HelpCircle className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Need Help?</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                If you believe you've been incorrectly charged or have questions about our refund policy, 
                we're here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href={`/${locale}/support`}
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Support
                </Link>
                <Link 
                  href={`/${locale}/account`}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Manage Subscription
                </Link>
              </div>
            </div>
          </section>

          {/* Legal Notice */}
          <section className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-600">
              This refund policy is part of our{' '}
              <Link href={`/${locale}/terms`} className="text-blue-600 hover:underline">
                Terms of Service
              </Link>
              . By using CoverGen Pro, you agree to these terms.
              <br />
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}