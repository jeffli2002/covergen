import { Metadata } from 'next'
import PricingSection from '@/components/pricing-section'
import { Locale } from '@/lib/i18n/config'

export const metadata: Metadata = {
  title: 'Pricing - 7-Day Free Trial + Affordable AI Cover Plans',
  description: '7-day free trial with 3 covers daily, then Pro plans starting at $9/month for unlimited generations. Create professional covers for all platforms.',
  keywords: [
    'CoverGen AI pricing',
    'cover generator pricing',
    'AI design tool cost',
    'thumbnail maker pricing',
    'content creator tools pricing',
    'affordable cover generator',
    '7-day free trial',
    'pro cover generation',
    'daily generation limits'
  ],
  openGraph: {
    title: 'CoverGen AI Pricing - 7-Day Free Trial + Pro Plans',
    description: '7-day free trial with 3 covers daily. Upgrade for unlimited generations starting at $9/month.',
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
        name: 'Free Trial',
        price: '0',
        priceCurrency: 'USD',
        description: '7-day free trial, 3 covers per day, all platform sizes'
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
          billingDuration: 'P1M'
        },
        description: 'Unlimited daily generations, commercial use, all features'
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
          billingDuration: 'P1M'
        },
        description: 'Unlimited generations, full commercial license, API access, dedicated support'
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
                Start with a 7-day free trial with 3 daily generations. 
                Upgrade for unlimited cover creation.
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
                    How does the 7-day free trial work?
                  </h3>
                  <p className="text-gray-600">
                    All new users get a 7-day free trial with 3 cover generations per day. 
                    You have full access to all platform sizes and features. After the trial, 
                    you'll need to upgrade to continue generating covers.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3">
                    What happens when I reach my daily limit?
                  </h3>
                  <p className="text-gray-600">
                    During the trial, you can generate up to 3 covers per day. When you reach 
                    this limit, you'll see an upgrade prompt. Your daily limit resets at midnight UTC, 
                    or you can upgrade to Pro for unlimited generations.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3">
                    Do you offer refunds?
                  </h3>
                  <p className="text-gray-600">
                    We offer a 7-day money-back guarantee for first-time Pro and Pro+ subscribers. 
                    If you're not satisfied, contact support for a full refund.
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