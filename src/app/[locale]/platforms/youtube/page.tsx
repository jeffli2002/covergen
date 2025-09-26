import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import YouTubeThumbnailMakerClient from './page-client'
import { Metadata } from 'next'
import { generatePlatformMetadata } from '@/lib/seo/metadata'
import { getPlatformKeywords } from '@/lib/seo-utils'
import { getHighOpportunityKeywords } from '@/lib/seo/keyword-merger'
import ClientBoundary from '@/components/client-boundary'

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  // Get optimized keywords from our SEO strategy
  const platformKeywords = getPlatformKeywords('youtube')
  const highOpportunityKeywords = getHighOpportunityKeywords().slice(0, 10).map(k => k.keyword)
  
  // Custom YouTube-specific metadata with enhanced keywords
  const metadata = generatePlatformMetadata('youtube', locale, searchParams)
  
  // Override with YouTube-specific optimizations
  return {
    ...metadata,
    title: 'YouTube Thumbnail Maker - Free AI Thumbnail Generator | CoverGen Pro',
    description: 'Create eye-catching YouTube thumbnails in seconds with AI. Free thumbnail maker with no watermark. Boost CTR by 40% with HD thumbnails optimized for YouTube algorithm. Perfect 1280x720 dimensions.',
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
  }
}

export default async function YouTubeThumbnailMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <YouTubeThumbnailMakerClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}