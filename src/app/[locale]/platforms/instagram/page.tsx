import ClientBoundary from '@/components/client-boundary'

import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import InstagramContentMakerClient from './page-client'
import { Metadata } from 'next'

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

export default async function InstagramContentMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <InstagramContentMakerClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}