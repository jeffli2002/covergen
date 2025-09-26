import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import YouTubeThumbnailIdeasClient from './page-client'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const title = (locale as string) === 'zh' 
    ? 'YouTube 缩略图创意大全 - 提升点击率的设计灵感' 
    : 'YouTube Thumbnail Ideas - Boost CTR with Creative Designs'
  
  const description = (locale as string) === 'zh'
    ? '发现数百个 YouTube 缩略图创意和设计灵感。学习如何制作吸引眼球的缩略图，提升视频点击率和观看量。'
    : 'Discover hundreds of YouTube thumbnail ideas and design inspiration. Learn how to create eye-catching thumbnails that boost CTR and video views.'

  return {
    title,
    description,
    keywords: 'youtube thumbnail ideas, youtube thumbnail inspiration, clickable thumbnails, youtube cover ideas, thumbnail design tips, youtube thumbnail examples, viral thumbnail designs, youtube thumbnail templates',
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['/og-youtube-ideas.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-youtube-ideas.png'],
    },
    alternates: {
      canonical: `/tools/youtube-thumbnail-ideas`,
      languages: {
        'en': '/en/tools/youtube-thumbnail-ideas',
        'zh': '/zh/tools/youtube-thumbnail-ideas',
      },
    },
  }
}

export default async function YouTubeThumbnailIdeasPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)
  
  return <YouTubeThumbnailIdeasClient locale={params.locale} translations={dict} />
}