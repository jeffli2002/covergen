import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'

import { getHighOpportunityKeywords } from '@/lib/seo/keyword-merger'

import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Get optimized keywords for this page
const keywords = [
  'facebook event cover maker',
  'facebook event cover',
  'facebook event banner',
  'facebook event image maker',
  'event cover photo',
  'facebook event cover generator',
  'facebook event banner maker',
  'facebook event cover size',
  'event banner creator',
  'facebook event photo maker',
  'social media event cover',
  'facebook event cover template',
  'free facebook event cover',
  'facebook event header',
  'event poster facebook',
  ...getHighOpportunityKeywords().slice(10, 15).map(k => k.keyword)
]

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return generateToolMetadata({
    tool: 'facebook-event-cover',
    locale,
    title: 'Facebook Event Cover ',
    description: 'AI-powered facebook event cover generator with perfect dimensions and instant results.',
    keywords: [/* Add relevant keywords */],
  })
}/tools/facebook-event-cover`,
      siteName: 'CoverGen Pro',
      images: [
        {
          url: 'https://covergen.pro/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Facebook Event Cover Maker',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://covergen.pro/twitter-image.png'],
      creator: '@covergenai',
    },
    alternates: {
      canonical: `https://covergen.pro/${locale}/tools/facebook-event-cover`,
      languages: {
        'en': '/en/tools/facebook-event-cover',
        'es': '/es/tools/facebook-event-cover',
        'pt': '/pt/tools/facebook-event-cover',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// Lazy load heavy components
const FacebookEventCoverClient = dynamic(() => import('./page-client'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})

export default async function FacebookEventCoverPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)
  
  return <FacebookEventCoverClient locale={locale} translations={dict} />
}