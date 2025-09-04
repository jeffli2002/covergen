import { Metadata } from 'next'
import PricingSection from '@/components/pricing-section'
import { Locale } from '@/lib/i18n/config'

export const metadata: Metadata = {
  title: 'Pricing - AI Cover Generation Plans with Free Trial',
  description: 'Start free with 10 covers/month or try Pro plans with 7-day trial. Pro at $9/month (120 covers), Pro+ at $19/month (300 covers).',
  keywords: [
    'CoverGen AI pricing',
    'cover generator pricing',
    'AI design tool cost',
    'thumbnail maker pricing',
    'content creator tools pricing',
    'affordable cover generator',
    '7-day free trial',
    'pro cover generation',
    'monthly cover quotas'
  ],
  openGraph: {
    title: 'CoverGen AI Pricing - Free Plan + Pro with 7-Day Trial',
    description: 'Free plan: 10 covers/month. Pro plans include 7-day trial. Upgrade for more monthly covers.',
    images: ['/pricing-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/pricing',
  },
}

export default function PricingPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'CoverGen AI',
    description: 'AI-powered cover and thumbnail generator for content creators',
    brand: {
      '@type': 'Brand',
      name: 'CoverGen AI'
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        description: '10 covers per month, 3 per day max, personal use only'
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        price: '9',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '9',
          priceCurrency: 'USD',
          billingIncrement: 1,
          billingDuration: 'P1M',
          trialDuration: 'P7D'
        },
        description: '7-day free trial, 120 covers per month, commercial use, all features'
      },
      {
        '@type': 'Offer',
        name: 'Pro+ Plan',
        price: '19',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '19',
          priceCurrency: 'USD',
          billingIncrement: 1,
          billingDuration: 'P1M',
          trialDuration: 'P7D'
        },
        description: '7-day free trial, 300 covers per month, full commercial license, API access'
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      
      <div className="min-h-screen bg-background">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                Start free with 10 covers/month or try Pro plans with a 7-day trial.
              </p>
            </div>
            
            <PricingSection locale={locale} />
            
            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto mt-20">
              <h2 className="text-3xl font-bold text-center mb-12">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3">
                    Can I switch plans anytime?
                  </h3>
                  <p className="text-gray-600">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect 
                    immediately, and we'll prorate any payments.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-gray-600">
                    We accept all major credit cards via Stripe, PayPal, and in select regions, 
                    Alipay and WeChat Pay.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3">
                    How does the Pro/Pro+ trial work?
                  </h3>
                  <p className="text-gray-600">
                    Pro and Pro+ plans include a 7-day free trial. During the trial, Pro users get 28 covers 
                    (4/day) and Pro+ users get 70 covers (10/day). Trial usage doesn't count against your 
                    first paid month - you'll get the full monthly quota when your subscription begins.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3">
                    What happens when I reach my limit?
                  </h3>
                  <p className="text-gray-600">
                    Free users can generate 3 covers per day (10/month max). Pro/Pro+ users have monthly quotas 
                    with no fixed daily limit - you can use your remaining monthly balance anytime. When you reach 
                    your limit, you'll see an upgrade prompt or need to wait for the next billing cycle.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">
                      What happens after my trial ends?
                    </h3>
                    <p className="text-gray-600">
                      After your 7-day trial, your Pro or Pro+ subscription will automatically begin unless you 
                      cancel. You'll receive the full monthly quota (120 for Pro, 300 for Pro+) starting fresh - 
                      trial usage doesn't deduct from your paid month.
                    </p>
                  </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}