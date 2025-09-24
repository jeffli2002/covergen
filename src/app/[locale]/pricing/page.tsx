import { Metadata } from 'next'
import PricingSection from '@/components/pricing-section'
import { Locale } from '@/lib/i18n/config'
import { getStaticSubscriptionConfig, getStaticTrialPeriodText, isStaticTrialEnabled } from '@/lib/subscription-config-static'
import ClientBoundary from '@/components/client-boundary'

// Get configuration at build time
const config = getStaticSubscriptionConfig()
const trialText = getStaticTrialPeriodText()
const hasTrials = isStaticTrialEnabled()

export const metadata: Metadata = {
  title: hasTrials 
    ? 'Pricing - AI Cover Generation Plans with Free Trial'
    : 'Pricing - AI Cover Generation Plans',
  description: hasTrials
    ? `Start free with ${config.limits.free.monthly} covers/month or try Pro plans with ${trialText}. Pro at $9/month (${config.limits.pro.monthly} covers), Pro+ at $19/month (${config.limits.pro_plus.monthly} covers).`
    : `Start free with ${config.limits.free.monthly} covers/month. Pro at $9/month (${config.limits.pro.monthly} covers), Pro+ at $19/month (${config.limits.pro_plus.monthly} covers).`,
  keywords: [
    'CoverGen AI pricing',
    'cover generator pricing',
    'AI design tool cost',
    'thumbnail maker pricing',
    'content creator tools pricing',
    'affordable cover generator',
    hasTrials ? `${trialText}` : 'pro plans',
    'pro cover generation',
    'monthly cover quotas'
  ],
  openGraph: {
    title: hasTrials
      ? `CoverGen AI Pricing - Free Plan + Pro with ${config.trialDays}-Day Trial`
      : 'CoverGen AI Pricing - Choose Your Perfect Plan',
    description: hasTrials
      ? `Free plan: ${config.limits.free.monthly} covers/month. Pro plans include ${trialText}. Upgrade for more monthly covers.`
      : `Free plan: ${config.limits.free.monthly} covers/month. Upgrade to Pro for ${config.limits.pro.monthly} or Pro+ for ${config.limits.pro_plus.monthly} covers/month.`,
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
        description: `${config.limits.free.monthly} covers per month, ${config.limits.free.daily} per day max, personal use only`
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
          ...(hasTrials ? { trialDuration: `P${config.trialDays}D` } : {})
        },
        description: hasTrials 
          ? `${trialText}, ${config.limits.pro.monthly} covers per month, commercial use, all features`
          : `${config.limits.pro.monthly} covers per month, commercial use, all features`
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
          ...(hasTrials ? { trialDuration: `P${config.trialDays}D` } : {})
        },
        description: hasTrials
          ? `${trialText}, ${config.limits.pro_plus.monthly} covers per month, full commercial license`
          : `${config.limits.pro_plus.monthly} covers per month, full commercial license`
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
                {hasTrials
                  ? `Start free with ${config.limits.free.monthly} covers/month or try Pro plans with a ${trialText}.`
                  : `Start free with ${config.limits.free.monthly} covers/month or upgrade to Pro for more.`
                }
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
                    {hasTrials ? 'How does the Pro/Pro+ trial work?' : 'How do Pro/Pro+ plans work?'}
                  </h3>
                  <p className="text-gray-600">
                    {hasTrials ? (
                      `Pro and Pro+ plans include a ${trialText}. During the trial, Pro users get ${config.limits.pro.trial_total} covers 
                      (${config.limits.pro.trial_daily}/day) and Pro+ users get ${config.limits.pro_plus.trial_total} covers (${config.limits.pro_plus.trial_daily}/day). Trial usage doesn't count against your 
                      first paid month - you'll get the full monthly quota when your subscription begins.`
                    ) : (
                      `Pro plans offer ${config.limits.pro.monthly} covers per month and Pro+ plans offer ${config.limits.pro_plus.monthly} covers per month. 
                      You can use your monthly quota anytime without daily restrictions.`
                    )}
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3">
                    What happens when I reach my limit?
                  </h3>
                  <p className="text-gray-600">
                    Free users can generate {config.limits.free.daily} covers per day ({config.limits.free.monthly}/month max). Pro/Pro+ users have monthly quotas 
                    with no fixed daily limit - you can use your remaining monthly balance anytime. When you reach 
                    your limit, you'll see an upgrade prompt or need to wait for the next billing cycle.
                  </p>
                </div>
                
                {hasTrials && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">
                      What happens after my trial ends?
                    </h3>
                    <p className="text-gray-600">
                      After your {trialText}, your Pro or Pro+ subscription will automatically begin unless you 
                      cancel. You'll receive the full monthly quota ({config.limits.pro.monthly} for Pro, {config.limits.pro_plus.monthly} for Pro+) starting fresh - 
                      trial usage doesn't deduct from your paid month.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}