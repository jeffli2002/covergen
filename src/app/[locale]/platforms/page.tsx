import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import PlatformsHubClient from './page-client'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const dict = await getDictionary(locale)
  
  const title = 'Cover Makers for All Platforms - YouTube, TikTok, Spotify & More'
  const description = 'Create professional covers and thumbnails for every social media platform. AI-powered generators for YouTube, TikTok, Instagram, Spotify, LinkedIn, and 20+ platforms.'
  
  return {
    title,
    description,
    keywords: [
      'social media cover maker',
      'platform cover generator',
      'multi-platform cover creator',
      'youtube thumbnail maker',
      'tiktok cover maker',
      'instagram post maker',
      'spotify cover maker',
      'linkedin banner maker',
      'twitch thumbnail maker',
      'facebook cover maker',
      'twitter header maker',
      'social media design tool',
      'ai cover generator',
      'all platform cover maker',
      'content creator tools'
    ].join(', '),
    openGraph: {
      title,
      description,
      url: `https://covergen.pro/${locale}/platforms`,
      siteName: 'CoverGen Pro',
      images: [
        {
          url: 'https://covergen.pro/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Cover Makers for All Platforms',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://covergen.pro/twitter-image.png'],
      creator: '@covergenai',
    },
    alternates: {
      canonical: `https://covergen.pro/${locale}/platforms`,
      languages: {
        'en': '/en/platforms',
        'es': '/es/platforms',
        'pt': '/pt/platforms',
        'zh': '/zh/platforms',
        'ar': '/ar/platforms',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function PlatformsHubPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)
  
  return (
    <ClientBoundary>
      <PlatformsHubClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}