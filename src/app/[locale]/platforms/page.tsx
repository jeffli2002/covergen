import ClientBoundary from '@/components/client-boundary'
import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import PlatformsHubClient from './page-client'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  const dict = await getDictionary(locale)
  
  const title = 'Cover Makers for All Platforms - YouTube, TikTok, Spotify & More | CoverGen Pro'
  const description = 'Create professional covers and thumbnails for every social media platform. AI-powered generators for YouTube, TikTok, Instagram, Spotify, LinkedIn, and 20+ platforms.'
  
  // Use centralized metadata generation
  const metadata = generateSeoMetadata({
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
      'content creator tools',
      'free cover maker',
      'online thumbnail generator',
      'AI cover design tool'
    ],
    path: '/platforms',
    locale,
    searchParams,
  })
  
  return metadata
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