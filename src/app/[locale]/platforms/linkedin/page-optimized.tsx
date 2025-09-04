import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'

import { Metadata } from 'next'

import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'LinkedIn Banner & Post Image Maker - Professional Graphics',
  description: 'Create professional LinkedIn banners, post images, and article covers with AI. Boost your professional presence and engagement on LinkedIn.',
  keywords: [
    'LinkedIn banner maker',
    'LinkedIn post image generator',
    'LinkedIn article cover',
    'professional banner creator',
    'LinkedIn graphics generator',
    'LinkedIn profile banner',
    'business graphics maker',
    'LinkedIn carousel creator',
    'professional branding',
    'LinkedIn marketing tools'
  ],
  openGraph: {
    title: 'LinkedIn Graphics Maker - CoverGen AI',
    description: 'Create professional LinkedIn graphics that boost engagement. AI-powered banners, post images, and article covers.',
    images: ['/linkedin-graphics-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/platforms/linkedin',
  },
}

// Lazy load heavy components
const LinkedInGraphicsMakerClient = dynamic(() => import('./page-client'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})

export default async function LinkedInGraphicsMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return <LinkedInGraphicsMakerClient locale={locale} translations={dict} />
}