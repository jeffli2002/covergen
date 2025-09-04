import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'

import { Metadata } from 'next'

import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'TikTok Cover Maker - AI Video Cover Generator',
  description: 'Create viral TikTok covers that boost engagement. AI-powered vertical cover generation optimized for TikTok\'s algorithm and Gen-Z aesthetics.',
  keywords: [
    'TikTok cover maker',
    'TikTok thumbnail maker',
    'TikTok thumbnail generator',
    'TikTok cover creator',
    'TikTok poster maker',
    'TikTok cover image generator',
    'TikTok thumbnail designer',
    'TikTok poster image maker',
    'tiktok thumbnail maker',
    'TikTok video cover',
    'vertical video thumbnail',
    'TikTok cover design',
    'TikTok thumbnail size',
    'viral TikTok covers',
    'TikTok cover templates',
    'mobile video covers',
    'TikTok content creator tools',
    'TikTok story cover maker',
    'TikTok banner maker',
    'TikTok profile cover'
  ],
  openGraph: {
    title: 'TikTok Cover Maker - CoverGen AI',
    description: 'Create eye-catching TikTok covers that go viral. Perfect vertical format, trending styles, Gen-Z optimized.',
    images: ['/tiktok-cover-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/platforms/tiktok',
  },
}

// Lazy load heavy components
const TikTokCoverMakerClient = dynamic(() => import('./page-client'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})

export default async function TikTokCoverMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return <TikTokCoverMakerClient locale={locale} translations={dict} />
}