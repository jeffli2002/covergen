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
    title: 'Instagram Post & Story Maker - AI Content Creator | CoverGen Pro',
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
      'Instagram aesthetic',
      'Instagram cover design',
      'Instagram post generator',
      'free Instagram maker'
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