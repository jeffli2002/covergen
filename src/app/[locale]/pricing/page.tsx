import { Metadata } from 'next'
import PricingPage from '@/components/pricing/PricingPage'
import { Locale } from '@/lib/i18n/config'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo/metadata'
import { SUBSCRIPTION_CONFIG } from '@/config/subscription'

// Get configuration at build time
const config = SUBSCRIPTION_CONFIG

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  const { locale } = await params
  const title = 'Pricing - Credits-Based AI Generation Plans | CoverGen Pro'
  const description = `Flexible credits-based pricing for Nano Banana images and Sora 2 videos. Pro at $${config.pro.price.monthly}/month (${config.pro.points.monthly} credits), Pro+ at $${config.proPlus.price.monthly}/month (${config.proPlus.points.monthly} credits). Get ${config.free.signupBonusPoints} free credits on signup!`
    
  return generateSeoMetadata({
    title,
    description,
    keywords: [
      'CoverGen AI pricing',
      'credits-based pricing',
      'AI generation credits',
      'Sora 2 video pricing',
      'Nano Banana pricing',
      'flexible AI pricing',
      'pay as you go AI',
      'content creator tools pricing',
      'affordable AI generator',
      'pro AI plans',
      'video generation pricing',
      'image generation pricing'
    ],
    path: '/pricing',
    locale,
    searchParams,
    images: [{
      url: 'https://covergen.pro/pricing-og.jpg',
      width: 1200,
      height: 630,
      alt: 'CoverGen Pro Credits-Based Pricing Plans',
    }],
  })
}

export default async function PricingPageRoute({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'CoverGen AI',
    description: 'AI-powered image and video generator with flexible credits-based pricing',
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
        description: `${config.free.signupBonusPoints} credits on signup (one-time bonus, never expire)`
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        price: config.pro.price.monthly.toString(),
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: config.pro.price.monthly.toString(),
          priceCurrency: 'USD',
          billingIncrement: 1,
          billingDuration: 'P1M'
        },
        description: `${config.pro.points.monthly} credits per month, Sora 2 video generation, commercial use`
      },
      {
        '@type': 'Offer',
        name: 'Pro+ Plan',
        price: config.proPlus.price.monthly.toString(),
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: config.proPlus.price.monthly.toString(),
          priceCurrency: 'USD',
          billingIncrement: 1,
          billingDuration: 'P1M'
        },
        description: `${config.proPlus.points.monthly} credits per month, Sora 2 Pro video quality, full commercial license`
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      
      <PricingPage locale={locale} />
    </>
  )
}