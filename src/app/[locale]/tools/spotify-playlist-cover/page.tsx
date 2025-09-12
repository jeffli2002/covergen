import ClientBoundary from '@/components/client-boundary'

import SpotifyPlaylistCoverClient from './page-client'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Spotify Playlist Cover Maker - Create AI Covers | CoverGen Pro',
  description: 'Design professional Spotify playlist covers with AI. Create eye-catching 300x300 pixel artwork that makes your playlists stand out. Free, instant generation.',
  keywords: 'spotify playlist cover, playlist cover maker, spotify cover generator, playlist artwork, music cover design',
  openGraph: {
    title: 'Spotify Playlist Cover Maker - AI-Powered Design Tool',
    description: 'Create stunning Spotify playlist covers in seconds with AI. Perfect 300x300 dimensions, genre-specific styles, free to use.',
    type: 'website',
  },
}

export default async function SpotifyPlaylistCoverPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)

  return (
    <ClientBoundary>
      <SpotifyPlaylistCoverClient locale={params.locale} translations={dict} />
    </ClientBoundary>
  )
}