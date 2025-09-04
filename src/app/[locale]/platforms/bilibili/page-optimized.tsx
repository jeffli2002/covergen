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
  'bilibili cover maker',
  'bilibili thumbnail maker',
  'bilibili video cover',
  'B站封面制作器',
  'B站缩略图制作器',
  'bilibili cover generator',
  'bilibili poster maker',
  'B站海报制作器',
  'bilibili video thumbnail',
  'chinese video cover maker',
  'bilibili cover design',
  'B站封面设计',
  'bilibili cover creator',
  'bilibili cover art',
  'bilibili channel cover',
  ...getHighOpportunityKeywords().slice(0, 5).map(k => k.keyword)
]

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return generatePlatformMetadata({
    platform: 'bilibili',
    locale,
    title: 'Bilibili Video Cover Maker',
    description: 'AI-powered bilibili video cover generator with perfect dimensions and instant results.',
    additionalKeywords: keywords,
  })
}


// Lazy load heavy components
const BilibiliCoverClient = dynamic(() => import('./page-client'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})

export default async function BilibiliVideoCoverPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)
  
  return <BilibiliCoverClient locale={locale} translations={dict} />
}