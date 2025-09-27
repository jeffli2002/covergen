import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import PodcastCoverMakerClient from './page-client'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const title = (locale as string) === 'zh' 
    ? '播客封面制作器 - AI 播客封面生成器' 
    : 'Podcast Cover Maker - AI Podcast Art Generator'
  
  const description = (locale as string) === 'zh'
    ? '为您的播客创建专业封面。AI 生成完美尺寸的播客艺术作品，符合所有平台要求。'
    : 'Create professional podcast covers with AI. Perfect 3000x3000 dimensions for Apple Podcasts, Spotify, and all major platforms.'

  return {
    title,
    description,
    keywords: 'podcast cover maker, podcast cover art maker, podcast artwork generator, podcast cover design, podcast thumbnail creator, podcast cover dimensions, apple podcast cover, spotify podcast cover, podcast branding, free podcast cover maker',
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['/og-podcast-cover.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-podcast-cover.png'],
    },
    alternates: {
      canonical: `/tools/podcast-cover-maker`,
      languages: {
        'en': '/en/tools/podcast-cover-maker',
        'zh': '/zh/tools/podcast-cover-maker',
      },
    },
  }
}

export default async function PodcastCoverMakerPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)
  
  return <PodcastCoverMakerClient locale={params.locale} translations={dict} />
}