import ClientBoundary from '@/components/client-boundary'

import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import SpotifyPlaylistCoverMakerClient from './page-client'
import { Metadata } from 'next'

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

export default async function SpotifyPlaylistCoverMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <SpotifyPlaylistCoverMakerClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}