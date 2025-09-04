import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'

import { Metadata } from 'next'

import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Twitch Stream Overlay & Banner Maker - AI Generator',
  description: 'Create professional Twitch overlays, banners, and panels with AI. Boost your stream aesthetics and grow your channel with eye-catching graphics.',
  keywords: [
    'Twitch overlay maker',
    'Twitch banner generator',
    'Twitch panel maker',
    'stream overlay creator',
    'Twitch graphics generator',
    'Twitch offline banner',
    'Twitch profile banner',
    'stream design tools',
    'Twitch branding',
    'streaming graphics'
  ],
  openGraph: {
    title: 'Twitch Graphics Maker - CoverGen AI',
    description: 'Create stunning Twitch graphics that make your stream stand out. AI-powered overlays, banners, and panels.',
    images: ['/twitch-graphics-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/platforms/twitch',
  },
}

// Lazy load heavy components
const TwitchGraphicsMakerClient = dynamic(() => import('./page-client'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})

export default async function TwitchGraphicsMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return <TwitchGraphicsMakerClient locale={locale} translations={dict} />
}