import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'

import { Metadata } from 'next'
import { getPlatformKeywords } from '@/lib/seo-utils'
import { getHighOpportunityKeywords } from '@/lib/seo/keyword-merger'

import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Get optimized keywords from our SEO strategy
const platformKeywords = getPlatformKeywords('youtube')
const highOpportunityKeywords = getHighOpportunityKeywords().slice(0, 10).map(k => k.keyword)

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return generatePlatformMetadata({
    platform: 'youtube',
    locale,
    title: 'Youtube Cover Maker',
    description: 'AI-powered youtube generator with perfect dimensions and instant results.',
    
  })
}/platforms/youtube`,
      siteName: 'CoverGen Pro',
      images: [
        {
          url: 'https://covergen.pro/og-image.png',
          width: 1200,
          height: 630,
          alt: 'YouTube Thumbnail Maker - AI Powered',
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
      canonical: `https://covergen.pro/${locale}/platforms/youtube`,
      languages: {
        'en': '/en/platforms/youtube',
        'es': '/es/platforms/youtube',
        'pt': '/pt/platforms/youtube',
        'zh': '/zh/platforms/youtube',
        'ar': '/ar/platforms/youtube',
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
const YouTubeThumbnailMakerClient = dynamic(() => import('./page-client'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})

export default async function YouTubeThumbnailMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return <YouTubeThumbnailMakerClient locale={locale} translations={dict} />
}