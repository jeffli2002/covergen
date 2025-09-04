import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'

import { Metadata } from 'next'

import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Instagram Post & Story Maker - AI Content Creator',
  description: 'Create stunning Instagram posts, stories, and reels covers with AI. Perfect square posts, story graphics, and carousel designs that boost engagement.',
  keywords: [
    'Instagram post maker',
    'Instagram story creator',
    'Instagram reel cover',
    'Instagram carousel maker',
    'Instagram graphic designer',
    'Instagram content creator',
    'Instagram template maker',
    'social media graphics',
    'Instagram feed planner',
    'Instagram aesthetic'
  ],
  openGraph: {
    title: 'Instagram Content Maker - CoverGen AI',
    description: 'Create scroll-stopping Instagram content. AI-powered posts, stories, and reel covers that grow your following.',
    images: ['/instagram-content-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/platforms/instagram',
  },
}

// Lazy load heavy components
const InstagramContentMakerClient = dynamic(() => import('./page-client'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})

export default async function InstagramContentMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return <InstagramContentMakerClient locale={locale} translations={dict} />
}