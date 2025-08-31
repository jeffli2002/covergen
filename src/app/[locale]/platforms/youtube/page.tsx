import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import YouTubeThumbnailMakerClient from './page-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'YouTube Thumbnail Maker - AI-Powered Thumbnail Generator',
  description: 'Create eye-catching YouTube thumbnails in seconds with AI. Boost your CTR by 40% with professional thumbnails optimized for YouTube\'s algorithm.',
  keywords: [
    'YouTube thumbnail maker',
    'YouTube thumbnail generator',
    'AI thumbnail creator',
    'YouTube cover maker',
    'thumbnail design tool',
    'YouTube thumbnail size',
    'clickbait thumbnail generator',
    'YouTube thumbnail templates',
    'free thumbnail maker',
    'YouTube thumbnail ideas'
  ],
  openGraph: {
    title: 'YouTube Thumbnail Maker - CoverGen AI',
    description: 'Create stunning YouTube thumbnails that get clicks. AI-powered generation, perfect dimensions, optimized for mobile viewing.',
    images: ['/youtube-thumbnail-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/platforms/youtube',
  },
}

export default async function YouTubeThumbnailMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return <YouTubeThumbnailMakerClient locale={locale} translations={dict} />
}