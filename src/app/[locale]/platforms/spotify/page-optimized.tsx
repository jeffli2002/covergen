import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'

import { Metadata } from 'next'

import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Spotify Playlist Cover Maker - AI Cover Art Generator',
  description: 'Create stunning Spotify playlist covers and podcast artwork with AI. Stand out with professional cover art that gets more streams and followers.',
  keywords: [
    'Spotify playlist cover maker',
    'Spotify cover art generator',
    'playlist cover design',
    'Spotify canvas maker',
    'podcast cover creator',
    'album art generator',
    'Spotify playlist art',
    'music cover designer',
    'Spotify branding',
    'playlist aesthetic'
  ],
  openGraph: {
    title: 'Spotify Cover Art Maker - CoverGen AI',
    description: 'Create eye-catching Spotify playlist covers and podcast art. Perfect 640x640 format, algorithm-optimized designs.',
    images: ['/spotify-cover-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/platforms/spotify',
  },
}

// Lazy load heavy components
const SpotifyPlaylistCoverMakerClient = dynamic(() => import('./page-client'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})

export default async function SpotifyPlaylistCoverMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return <SpotifyPlaylistCoverMakerClient locale={locale} translations={dict} />
}