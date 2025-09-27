import ClientBoundary from '@/components/client-boundary'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import InstagramContentMakerClient from './page-client'
import { Metadata } from 'next'
import { generatePlatformMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  const metadata = generatePlatformMetadata('instagram', locale, searchParams)
  
  // Override with Instagram-specific optimizations
  return {
    ...metadata,
    title: 'Instagram Thumbnail Maker - AI Post & Story Creator | CoverGen Pro',
    description: 'Create stunning Instagram thumbnails, posts, and stories with AI. Instagram grid maker, highlight cover maker, and post designer all in one tool. Perfect dimensions for maximum engagement.',
    keywords: [
      'instagram thumbnail maker',
      'instagram post maker', 
      'instagram grid maker',
      'instagram highlight cover maker',
      'instagram story designer',
      'instagram thumbnail generator',
      'instagram cover creator',
      'ig thumbnail maker',
      'instagram reel cover',
      'instagram carousel maker',
      'instagram graphic designer',
      'instagram content creator',
      'instagram template maker',
      'social media graphics',
      'instagram feed planner',
      'instagram aesthetic',
      'instagram cover design',
      'instagram post generator',
      'free instagram maker'
    ].join(', '),
  }
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