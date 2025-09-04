import { Metadata } from 'next'
import PricingSection from '@/components/pricing-section'
import { Locale } from '@/lib/i18n/config'

export const metadata: Metadata = {
  title: 'Pricing - Affordable AI Cover Generation Plans',
  description: 'Choose the perfect plan for your content creation needs. Free tier available, Pro plans starting at $9/month. Create professional covers for all platforms.',
  keywords: [
    'CoverGen AI pricing',
    'cover generator pricing',
    'AI design tool cost',
    'thumbnail maker pricing',
    'content creator tools pricing',
    'affordable cover generator',
    'free thumbnail maker',
    'pro cover generation'
  ],
  openGraph: {
    title: 'CoverGen AI Pricing - Plans for Every Creator',
    description: 'From free to pro - find the perfect plan for your content creation needs. AI cover generation starting at $9/month.',
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
        description: '10 covers per month, personal use only, email support'
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
        description: '120 covers per month, commercial use, 24-hour download history'
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
        description: '300 covers per month, full commercial license, 7-day cloud gallery, API access'
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
                Choose the perfect plan for your content creation needs. 
                Start free, upgrade when you're ready.
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
                    Is there a free trial for Pro plans?
                  </h3>
                  <p className="text-gray-600">
                    While we don't offer a traditional free trial, our Free plan lets you test 
                    the platform with 10 covers per month. This gives you a chance to experience 
                    the quality before upgrading.
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