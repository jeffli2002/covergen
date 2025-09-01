'use client'

import { ArrowLeft, CreditCard, Clock, CheckCircle2, XCircle, AlertCircle, Mail, Shield, HelpCircle } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'

interface RefundPageClientProps {
  locale: Locale
  translations: any
}

export default function RefundPageClient({ locale, translations: t }: RefundPageClientProps) {
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
            Your satisfaction is our priority. We offer a fair and transparent refund policy.
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-600 mt-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-lg">Last Updated: August 31, 2025</p>
          </div>
        </div>

        {/* Quick Summary Card */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-12 border border-green-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            Our Refund Commitment
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">7-Day Guarantee</h3>
              <p className="text-gray-600 text-sm">
                Full refund within 7 days of your first subscription
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No Questions Asked</h3>
              <p className="text-gray-600 text-sm">
                First-time subscribers can get a full refund, no questions
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Response</h3>
              <p className="text-gray-600 text-sm">
                We respond to all refund requests within 3 business days
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Eligibility Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Eligibility</h2>
            
            <div className="space-y-6">
              {/* 7-Day Money Back Guarantee */}
              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  7-Day Money Back Guarantee
                </h3>
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 mb-3">
                    <strong>First-time subscribers</strong> are eligible for a full refund within 7 days of purchase if:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>This is your first paid subscription with CoverGen Pro</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>You request the refund within 7 days of the initial purchase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>You haven't previously received a refund from us</span>
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
                    We provide <strong>pro-rated refunds</strong> for:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Service outages lasting more than 24 consecutive hours</li>
                    <li>• Inability to access paid features for extended periods</li>
                    <li>• Major functionality issues preventing normal use</li>
                  </ul>
                </div>
              </div>

              {/* Billing Errors */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  Billing Errors
                </h3>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-3">
                    <strong>Full refunds</strong> are provided for:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Accidental duplicate charges</li>
                    <li>• Unauthorized charges after cancellation</li>
                    <li>• Incorrect billing amounts</li>
                    <li>• Technical errors in our payment system</li>
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
                We <strong>cannot</strong> provide refunds for:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Change of mind</strong> after the 7-day guarantee period
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Partial month/year</strong> when cancelling mid-billing cycle
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Feature requests</strong> or functionality you expected but isn't available
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Account suspension</strong> due to Terms of Service violations
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Consumed credits</strong> or generations already used
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>AI generation quality</strong> that doesn't meet personal preferences
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Network-related issues</strong> outside our control
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>AI limitations</strong> in understanding complex or ambiguous prompts
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Request a Refund</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Step-by-Step Process</h3>
                
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
                        <li>• Transaction ID (if available)</li>
                        <li>• Reason for refund request</li>
                        <li>• Date of purchase</li>
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
                      <p className="font-semibold text-gray-900">Refund processing</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Approved refunds are processed within 5-10 business days
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> Refund timing depends on your payment method and bank. Credit card refunds typically appear within 5-10 business days, while PayPal refunds are usually instant.
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
                  <li>• 10 covers per month</li>
                  <li>• Personal use only</li>
                  <li>• No commercial rights</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Pro Plan</h3>
                <p className="text-sm text-gray-600 mb-2">$9/month</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 120 covers per month</li>
                  <li>• Personal & commercial use</li>
                  <li>• 24-hour download history</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Pro+ Plan</h3>
                <p className="text-sm text-gray-600 mb-2">$19/month</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 300 covers per month</li>
                  <li>• Full commercial license</li>
                  <li>• 7-day cloud gallery</li>
                  <li>• Team & enterprise use</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                <strong>Important:</strong> Refunds do not affect the usage rights of content generated during your paid subscription period. Content created under Pro/Pro+ plans retains its commercial usage rights even after downgrading or refund.
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
                  Annual plans follow the same 7-day guarantee. After 7 days, we may offer pro-rated refunds for unused months in exceptional circumstances.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  Payment Disputes
                </h3>
                <p className="text-gray-600 text-sm">
                  Please contact us before initiating a chargeback. We're committed to resolving issues fairly and quickly.
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
                  What happens to my usage rights after a refund?
                </h3>
                <p className="text-gray-600">
                  Your account returns to the Free plan (10 covers per month, personal use only). Previously generated content under Pro/Pro+ plans retains its commercial usage rights. All your data, images, and settings are preserved.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I get a refund if I forgot to cancel?
                </h3>
                <p className="text-gray-600">
                  If you contact us within 48 hours of an unwanted renewal, we'll typically issue a full refund as a one-time courtesy.
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
                  What if my refund request is denied?
                </h3>
                <p className="text-gray-600">
                  We'll always explain why a refund cannot be issued. You can appeal the decision by providing additional information or context.
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