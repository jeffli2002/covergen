import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Shield, CreditCard, UserCheck } from 'lucide-react'
import { PRICING_CONFIG } from '@/config/pricing.config'

export const metadata: Metadata = {
  title: 'Terms of Service | CoverGen',
  description: 'Terms of Service for CoverGen - AI-powered cover and video generation platform',
}

export default function TermsPage() {
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
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <FileText className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Effective Date: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to CoverGen ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of CoverGen's website, services, and products (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-blue-600 mt-1" />
              <h2 className="text-2xl font-bold text-gray-900">2. Account Registration</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>To use certain features of the Service, you must create an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
                <li>Use only one account per person</li>
              </ul>
            </div>
          </section>

          {/* Subscription and Credits */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-green-600 mt-1" />
              <h2 className="text-2xl font-bold text-gray-900">3. Subscription and Credits</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <h3 className="font-semibold text-gray-900">3.1 Subscription Plans</h3>
              <p>We offer three subscription tiers:</p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                {PRICING_CONFIG.plans.map(plan => (
                  <div key={plan.id} className="flex justify-between">
                    <span className="font-medium">{plan.name}:</span>
                    <span>
                      {plan.price.monthly === 0 
                        ? 'Free' 
                        : `$${plan.price.monthly.toFixed(1)}/mo or $${plan.price.yearly.toFixed(2)}/year (${plan.credits.monthly.toLocaleString()} credits/mo or ${plan.credits.yearly.toLocaleString()} credits/year)`}
                    </span>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-gray-900">3.2 Credits System</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Paid subscriptions include monthly credits that refresh at the start of each billing cycle</li>
                <li>Subscription credits do not roll over to the next billing period</li>
                <li>One-time credit packs never expire and can be used at any time</li>
                <li>Free users receive {PRICING_CONFIG.plans[0].credits.onSignup} signup bonus credits that never expire</li>
                <li>Generation costs: Nano Banana Images ({PRICING_CONFIG.generationCosts.nanoBananaImage} credits), Sora 2 Videos ({PRICING_CONFIG.generationCosts.sora2Video} credits), Sora 2 Pro Videos ({PRICING_CONFIG.generationCosts.sora2ProVideo} credits)</li>
              </ul>

              <h3 className="font-semibold text-gray-900">3.3 Billing</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscriptions are billed in advance on a monthly or yearly basis</li>
                <li>Annual subscriptions receive a 20% discount</li>
                <li>Billing occurs on the same day each billing cycle</li>
                <li>You must provide valid payment information</li>
                <li>Failed payments may result in service suspension</li>
              </ul>
            </div>
          </section>

          {/* Usage License */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-6 h-6 text-purple-600 mt-1" />
              <h2 className="text-2xl font-bold text-gray-900">4. Usage License and Restrictions</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <h3 className="font-semibold text-gray-900">4.1 Content License</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Free Plan:</strong> Personal, non-commercial use only</li>
                <li><strong>Pro & Pro+ Plans:</strong> Commercial usage rights included</li>
                <li>You own the outputs generated through our Service</li>
                <li>We retain the right to use generated content for marketing (with your permission)</li>
              </ul>

              <h3 className="font-semibold text-gray-900">4.2 Prohibited Uses</h3>
              <p>You may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Generate illegal, harmful, or offensive content</li>
                <li>Violate intellectual property rights of others</li>
                <li>Attempt to reverse engineer our AI models</li>
                <li>Share account credentials with others</li>
                <li>Use the Service to compete with us</li>
                <li>Automate requests beyond reasonable limits</li>
              </ul>
            </div>
          </section>

          {/* Cancellation and Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cancellation and Refunds</h2>
            <div className="space-y-4 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>You may cancel your subscription at any time</li>
                <li>Cancellations take effect at the end of the current billing period</li>
                <li>14-day money-back guarantee for first-time subscription purchases</li>
                <li>One-time credit packs are non-refundable</li>
                <li>Partial refunds are not provided for unused credits</li>
              </ul>
              <p className="text-sm text-gray-600">
                See our <Link href="/refund-policy" className="text-blue-600 hover:underline">Refund Policy</Link> for complete details.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Termination</h2>
            <div className="space-y-4 text-gray-700">
              <p>We reserve the right to suspend or terminate your account if you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent activity</li>
                <li>Abuse or misuse the Service</li>
                <li>Fail to pay for services</li>
              </ul>
              <p>Upon termination, your access to the Service will cease, and any unused credits will be forfeited.</p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2 text-gray-700">
              <p className="font-semibold">THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-700">
              We may update these Terms from time to time. We will notify you of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">CoverGen Support</p>
              <p className="text-gray-700">Email: support@covergen.pro</p>
              <p className="text-gray-700">Website: covergen.pro</p>
            </div>
          </section>

        </div>

        {/* Related Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/privacy">Privacy Policy</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/refund-policy">Refund Policy</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
