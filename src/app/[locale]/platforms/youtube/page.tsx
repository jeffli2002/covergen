import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import YouTubeThumbnailMakerClient from './page-client'
import { Metadata } from 'next'
import { getPlatformKeywords } from '@/lib/seo-utils'
import { getHighOpportunityKeywords } from '@/lib/seo/keyword-merger'

// Get optimized keywords from our SEO strategy
const platformKeywords = getPlatformKeywords('youtube')
const highOpportunityKeywords = getHighOpportunityKeywords().slice(0, 10).map(k => k.keyword)

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const dict = await getDictionary(locale)
  
  const title = 'YouTube Thumbnail Maker - Free AI Thumbnail Generator | CoverGen Pro'
  const description = 'Create eye-catching YouTube thumbnails in seconds with AI. Free thumbnail maker with no watermark. Boost CTR by 40% with HD thumbnails optimized for YouTube algorithm. Perfect 1280x720 dimensions.'
  
  return {
    title,
    description,
    keywords: [
      // High-value keywords from our research
      'youtube thumbnail maker',
      'free thumbnail maker',
      'youtube thumbnail generator',
      'ai thumbnail maker',
      'thumbnail maker no watermark',
      'youtube thumbnail ideas',
      'youtube gaming thumbnail maker',
      'best thumbnail maker for youtube',
      'youtube thumbnail size',
      'youtube thumbnail templates',
      'free youtube thumbnail maker',
      'youtube thumbnail maker app',
      'create youtube thumbnail',
      'youtube cover maker',
      'thumbnail generator free',
      'youtube thumbnail design',
      'gaming thumbnail maker',
      'clickbait thumbnail generator',
      'youtube banner maker',
      'youtube channel art maker',
      ...platformKeywords,
      ...highOpportunityKeywords
    ].join(', '),
    openGraph: {
      title,
      description,
      url: `https://covergen.pro/${locale}/platforms/youtube`,
      siteName: 'CoverGen Pro',
      images: [
        {
          url: 'https://covergen.pro/og-image.png',
          width: 1200,
          height: 630,
          alt: 'YouTube Thumbnail Maker - AI Powered',
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
      canonical: `https://covergen.pro/${locale}/platforms/youtube`,
      languages: {
        'en': '/en/platforms/youtube',
        'es': '/es/platforms/youtube',
        'pt': '/pt/platforms/youtube',
        'zh': '/zh/platforms/youtube',
        'ar': '/ar/platforms/youtube',
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

export default async function YouTubeThumbnailMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return <YouTubeThumbnailMakerClient locale={locale} translations={dict} />
}