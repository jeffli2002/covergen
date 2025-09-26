import ClientBoundary from '@/components/client-boundary'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import SpotifyPlaylistCoverMakerClient from './page-client'
import { Metadata } from 'next'
import { generatePlatformMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  const metadata = generatePlatformMetadata('spotify', locale, searchParams)
  
  // Override with Spotify-specific optimizations
  return {
    ...metadata,
    title: 'Spotify Playlist Cover Maker - AI Cover Art Generator | CoverGen Pro',
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
      'playlist aesthetic',
      'Spotify cover maker free',
      'Spotify playlist cover size',
      'Spotify album cover maker',
      'free Spotify cover art',
      'Spotify cover no watermark'
    ].join(', '),
  }
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