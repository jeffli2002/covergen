import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'

import { Metadata } from 'next'

import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Rednote (小红书) Cover Maker - AI Cover Generator',
  description: 'Create stunning Rednote (小红书) covers and post images with AI. Perfect for lifestyle, beauty, fashion, and travel content that gets discovered.',
  keywords: [
    'Rednote cover maker',
    '小红书封面制作',
    'Rednote cover generator',
    'RedNote cover creator',
    'Rednote post design',
    'lifestyle cover maker',
    'beauty post generator',
    'fashion cover design',
    'travel post creator',
    'Chinese social media graphics'
  ],
  openGraph: {
    title: 'Rednote Cover Maker - CoverGen AI',
    description: 'Create eye-catching Rednote covers that boost engagement. AI-powered designs for lifestyle, beauty, and fashion content.',
    images: ['/rednote-cover-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/platforms/rednote',
  },
}

// Lazy load heavy components
const RednoteCoverMakerClient = dynamic(() => import('./page-client'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})

export default async function RednoteCoverMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return <RednoteCoverMakerClient locale={locale} translations={dict} />
}