import ClientBoundary from '@/components/client-boundary'

import InstagramThumbnailMakerClient from './page-client'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Instagram Thumbnail Maker - Create Stunning Reels & Post Covers | CoverGen Pro',
  description: 'Design perfect Instagram thumbnails with AI. Optimized for Reels (9:16), Feed posts (1:1), and Stories. Create covers that boost engagement and views.',
  keywords: 'instagram thumbnail maker, instagram reels thumbnail, instagram cover maker, instagram feed preview, instagram story cover, free instagram thumbnail generator, instagram post thumbnail, instagram reel cover maker',
  openGraph: {
    title: 'Instagram Thumbnail Maker - AI-Powered Design | CoverGen Pro',
    description: 'Create engaging Instagram thumbnails that drive views and engagement. Perfect dimensions for all Instagram formats.',
    type: 'website',
  },
}

export default async function InstagramThumbnailMakerPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)

  return (
    <ClientBoundary>
      <InstagramThumbnailMakerClient locale={params.locale} translations={dict} />
    </ClientBoundary>
  )
}