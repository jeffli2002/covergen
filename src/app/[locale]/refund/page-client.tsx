'use client'

import { ArrowLeft, CreditCard, Clock, CheckCircle2, XCircle, AlertCircle, Mail, Shield, HelpCircle } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import { getClientSubscriptionConfig, getTrialPeriodFullText, isTrialEnabledClient } from '@/lib/subscription-config-client'

interface RefundPageClientProps {
  locale: Locale
  translations: any
}

export default function RefundPageClient({ locale, translations: t }: RefundPageClientProps) {
  // Get configuration for dynamic values
  const config = getClientSubscriptionConfig()
  const trialFullText = getTrialPeriodFullText()
  const hasTrials = isTrialEnabledClient()
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            All sales are final. {hasTrials && `Pro/Pro+ plans include a ${trialFullText} to evaluate our service before committing.`}
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-600 mt-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-lg">Last Updated: January 2025</p>
          </div>
        </div>

        {/* Quick Summary Card */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-12 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            Our Sales Policy
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{hasTrials ? getTrialPeriodFullText().replace('free ', '').charAt(0).toUpperCase() + getTrialPeriodFullText().replace('free ', '').slice(1) : 'No Trial'}</h3>
              <p className="text-gray-600 text-sm">
                {hasTrials 
                  ? `Pro/Pro+ plans include a ${config.trialDays}-day trial period to test features`
                  : 'Try our free plan to test features'
                }
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Try Before You Buy</h3>
              <p className="text-gray-600 text-sm">
                Cancel your trial anytime before it converts to a paid subscription
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Billing Support</h3>
              <p className="text-gray-600 text-sm">
                We quickly resolve billing errors and technical issues
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Eligibility Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Policy</h2>
            
            <div className="space-y-6">
              {/* No Refunds Policy */}
              <div className="border-l-4 border-red-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  All Sales Are Final
                </h3>
                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 mb-3">
                    <strong>Due to the digital nature of our service</strong>, we do not offer refunds. However:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    {hasTrials && (
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Pro and Pro+ plans include a {trialFullText}</span>
                      </li>
                    )}
                    {hasTrials && (
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>You can cancel your trial anytime before it converts to paid</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Free plan available with {config.limits.free.monthly} covers per month</span>
                    </li>
                  </ul>
                </div>
              </div>


              {/* Service Issues */}
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  Service Issues & Outages
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-3">
                    We may provide <strong>service credits</strong> (not refunds) for:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Extended service outages at our discretion</li>
                    <li>• Major functionality issues caused by our platform</li>
                    <li>• Credits applied to future billing cycles only</li>
                  </ul>
                </div>
              </div>

              {/* Billing Errors - Only Exception */}
              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  Billing Error Corrections
                </h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-3">
                    <strong>We will correct</strong> verified billing errors:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Duplicate charges due to technical errors</li>
                    <li>• Charges after confirmed cancellation</li>
                    <li>• Incorrect billing amounts</li>
                    <li>• System errors causing overcharges</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Non-Refundable Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-500" />
              Non-Refundable Situations
            </h2>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Refunds will <strong>NOT</strong> be granted for:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Requests made after 60 days</strong> from the purchase date
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Dissatisfaction with generated content quality</strong> (subjective preferences)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Unused generation quotas</strong> (these do not roll over)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Violation of our Terms of Service</strong>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Accounts that have used</strong> more than 50% of monthly quota
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Mid-billing cycle cancellations</strong> (no partial refunds)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Technical issues</strong> on your device or network
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Failure to cancel</strong> {hasTrials && `during the ${config.trialDays}-day trial period`}
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                AI Generation Notice
              </h4>
              <p className="text-amber-800 text-sm">
                Due to the nature of AI technology, generation results can vary based on prompt quality, model capabilities, and system load. We recommend experimenting with different prompts and using our generation tips to achieve the best results. The need for multiple attempts is a normal part of the AI creative process and is not grounds for a refund.
              </p>
            </div>
          </section>

          {/* How to Request Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Report Billing Errors</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Error Resolution Process</h3>
                
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email our support team</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Send your request to <a href="mailto:support@covergen.pro" className="text-blue-600 hover:text-blue-700">support@covergen.pro</a>
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Include required information</p>
                      <ul className="text-gray-600 text-sm mt-1 space-y-1">
                        <li>• Account email address</li>
                        <li>• Transaction ID and screenshot</li>
                        <li>• Description of the billing error</li>
                        <li>• Date and amount of incorrect charge</li>
                      </ul>
                    </div>
                  </li>
                  
                  <li className="flex gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Receive response</p>
                      <p className="text-gray-600 text-sm mt-1">
                        We'll respond to your request within 3 business days
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                      4
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Error correction</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Verified billing errors are corrected within 5-10 business days
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> Billing error corrections depend on your payment method. Credit card corrections typically appear within 5-10 business days, while PayPal corrections are usually faster.
                </p>
              </div>
            </div>
          </section>

          {/* Subscription Plans Overview */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Plans & Usage Rights</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Free Plan</h3>
                <p className="text-sm text-gray-600 mb-2">$0/forever</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {config.limits.free.monthly} covers per month</li>
                  <li>• {config.limits.free.daily} covers per day max</li>
                  <li>• Personal use only</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Pro Plan</h3>
                <p className="text-sm text-gray-600 mb-2">$9/month</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {hasTrials && <li>• {trialFullText}</li>}
                  <li>• {config.limits.pro.monthly} covers per month</li>
                  <li>• Commercial usage rights</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Pro+ Plan</h3>
                <p className="text-sm text-gray-600 mb-2">$19/month</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {hasTrials && <li>• {trialFullText}</li>}
                  <li>• {config.limits.pro_plus.monthly} covers per month</li>
                  <li>• Full commercial license</li>
                  <li>• {config.trialDays}-day cloud gallery</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                <strong>Important:</strong> All sales are final. {hasTrials && `Pro/Pro+ plans include a ${config.trialDays}-day trial period where you can evaluate the service with prorated limits (${config.limits.pro.trial_total} covers for Pro trial, ${config.limits.pro_plus.trial_total} covers for Pro+ trial) before your paid subscription begins.`}
              </p>
            </div>
          </section>

          {/* Special Cases Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Special Cases</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Annual Subscriptions
                </h3>
                <p className="text-gray-600 text-sm">
                  {hasTrials 
                    ? `Annual plans also include a ${config.trialDays}-day trial period. After the trial, all payments are final. Consider monthly plans if you're unsure about long-term commitment.`
                    : 'Annual payments are final. Consider monthly plans if you're unsure about long-term commitment.'
                  }
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  Chargebacks
                </h3>
                <p className="text-gray-600 text-sm">
                  Please contact our support team before filing a chargeback. We actively dispute fraudulent chargebacks and excessive disputes may result in account termination.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  Regional Laws
                </h3>
                <p className="text-gray-600 text-sm">
                  Additional refund rights may apply based on your local consumer protection laws. We comply with all applicable regulations.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-500" />
                  Promotional Offers
                </h3>
                <p className="text-gray-600 text-sm">
                  Special promotional pricing may have different refund terms. Check the specific offer details at time of purchase.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I cancel during my Pro/Pro+ trial?
                </h3>
                <p className="text-gray-600">
                  {hasTrials 
                    ? `Yes! You can cancel your trial anytime before it converts to a paid subscription. Simply go to your account settings and cancel. You'll continue to have access to trial features until the ${config.trialDays}-day period ends.`
                    : 'Pro/Pro+ subscriptions can be cancelled anytime. You'll retain access until the end of your billing period.'
                  }
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What if I forget to cancel my trial?
                </h3>
                <p className="text-gray-600">
                  All sales are final once your trial converts to a paid subscription. We send reminder emails before your trial ends. Set a calendar reminder if needed to avoid unwanted charges.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  How do I avoid future charges?
                </h3>
                <p className="text-gray-600">
                  Cancel your subscription anytime through your account settings. You'll retain access until the end of your billing period.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Why don't you offer refunds?
                </h3>
                <p className="text-gray-600">
                  As a digital service, our resources are consumed immediately upon use. Pro/Pro+ trials let you fully evaluate the service risk-free. The free plan is always available for basic needs.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help?</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Contact Support</h3>
                <div className="space-y-3">
                  <a href="mailto:support@covergen.pro" className="flex items-center gap-3 text-blue-600 hover:text-blue-700">
                    <Mail className="w-5 h-5" />
                    support@covergen.pro
                  </a>
                  <p className="text-gray-600 text-sm">
                    Response time: Within 24 hours on business days
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Related Pages</h3>
                <div className="space-y-2">
                  <Link href={`/${locale}/terms`} className="text-blue-600 hover:text-blue-700 block">
                    Terms of Service →
                  </Link>
                  <Link href={`/${locale}/privacy`} className="text-blue-600 hover:text-blue-700 block">
                    Privacy Policy →
                  </Link>
                  <Link href={`/${locale}/pricing`} className="text-blue-600 hover:text-blue-700 block">
                    Pricing Plans →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            © 2025 CoverGen Pro. All rights reserved. | This policy is part of our <Link href={`/${locale}/terms`} className="text-blue-600 hover:text-blue-700">Terms of Service</Link>
          </p>
        </div>
      </div>
    </div>
  )
}