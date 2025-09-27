import ClientBoundary from '@/components/client-boundary'

import PodcastCoverMakerClient from './page-client'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Podcast Cover Maker - Create Professional Podcast Art | CoverGen Pro',
  description: 'Design professional podcast covers with AI. Perfect 3000x3000 dimensions for Apple Podcasts, Spotify, and all major platforms. Create covers that attract listeners.',
  keywords: 'podcast cover maker, podcast cover art maker, podcast artwork generator, podcast cover design, podcast thumbnail creator, podcast cover dimensions, apple podcast cover, spotify podcast cover, podcast branding, free podcast cover maker',
  openGraph: {
    title: 'Podcast Cover Maker - AI-Powered Design | CoverGen Pro',
    description: 'Create professional podcast covers that attract listeners. Perfect dimensions and designs.',
    type: 'website',
  },
}

export default async function PodcastCoverMakerPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)

  return (
    <ClientBoundary>
      <PodcastCoverMakerClient locale={params.locale} translations={dict} />
    </ClientBoundary>
  )
}