import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCcw, AlertCircle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Refund Policy | CoverGen',
  description: 'Refund Policy for CoverGen subscriptions and credit packs',
}

export default function RefundPolicyPage() {
  const lastUpdated = 'October 15, 2025'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-b from-green-900 to-green-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <RefreshCcw className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Refund Policy</h1>
          <p className="text-gray-200 max-w-2xl mx-auto">
            Effective Date: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 space-y-8">
          
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              At CoverGen, we want you to be completely satisfied with our Service. This Refund Policy outlines the conditions under which refunds are provided for subscriptions and credit pack purchases.
            </p>
          </section>

          {/* Subscription Refunds */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <h2 className="text-2xl font-bold text-gray-900">Subscription Refunds</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="font-semibold text-orange-900 mb-2">No Refund Policy</p>
                <p className="text-orange-800">
                  All subscription purchases are <strong>final and non-refundable</strong>. This includes first-time purchases, renewals, and upgrades. Credits consumed during any period are non-refundable.
                </p>
              </div>

              <h3 className="font-semibold text-gray-900 mt-6">Renewal Refunds</h3>
              <p>
                Subscription renewals (monthly or yearly) are <strong>non-refundable</strong> after the renewal date. We recommend setting a reminder before your renewal date if you wish to cancel.
              </p>

              <h3 className="font-semibold text-gray-900 mt-6">Proration for Upgrades</h3>
              <p>
                When upgrading from Pro to Pro+ mid-cycle, you will receive prorated credits immediately. Downgrades take effect at the end of the current billing period with no refund. All generation requires authentication and sufficient credits before processing.
              </p>
            </div>
          </section>

          {/* Credit Packs */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
              <h2 className="text-2xl font-bold text-gray-900">Credit Pack Refunds</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="font-semibold text-orange-900 mb-2">Non-Refundable</p>
                <p className="text-orange-800">
                  All credit pack purchases (one-time purchases) are <strong>final and non-refundable</strong> after payment is processed. This is because credits never expire and provide immediate value. All generation requires authentication and sufficient credits before processing starts.
                </p>
              </div>

              <p>
                However, if you experience technical issues preventing you from using purchased credits, please contact our support team, and we will work to resolve the issue.
              </p>
            </div>
          </section>

          {/* Cancellations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cancellation Policy</h2>
            <div className="space-y-4 text-gray-700">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You can cancel your subscription at any time from your account settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Cancellations take effect at the end of the current billing period</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You retain access to your plan benefits until the period ends</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Unused subscription credits expire at the end of the billing period</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Credits from one-time packs remain available even after cancellation</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Billing Errors & Technical Issues */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Billing Errors & Technical Issues</h2>
            <div className="space-y-4 text-gray-700">
              <p>While we have a no-refund policy, we will correct billing errors and address technical issues:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Email us at <a href="mailto:support@covergen.pro" className="text-blue-600 hover:underline">support@covergen.pro</a></li>
                <li>Include your account email and billing details</li>
                <li>Describe the billing error or technical issue</li>
                <li>Our team will respond within 2 business days</li>
                <li>If a billing error is confirmed, corrections are processed within 5-7 business days</li>
              </ol>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="font-semibold text-blue-900 mb-2">What We Will Correct</p>
                <p className="text-blue-800 text-sm">
                  We will correct duplicate charges, incorrect amounts, or charges for services not received due to technical issues on our end. All corrections are issued to the original payment method.
                </p>
              </div>
            </div>
          </section>

          {/* Exceptions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Exceptions</h2>
            <div className="space-y-4 text-gray-700">
              <p>All purchases are final and non-refundable in the following cases:</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="space-y-2 text-red-800">
                  <li>• All subscription purchases (first-time, renewals, upgrades)</li>
                  <li>• Account terminated due to Terms of Service violation</li>
                  <li>• Partial refunds for unused credits or time</li>
                  <li>• Credit pack purchases (always non-refundable)</li>
                  <li>• Credits consumed during any period</li>
                  <li>• Chargebacks or payment disputes (account may be suspended)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about our refund policy or need assistance, we're here to help:
            </p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">CoverGen Support</p>
              <p className="text-gray-700">Email: support@covergen.pro</p>
              <p className="text-gray-700">Response time: Within 24 hours</p>
            </div>
          </section>

        </div>

        {/* Related Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/terms">Terms of Service</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/privacy">Privacy Policy</Link>
          </Button>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
