import ClientBoundary from '@/components/client-boundary'

import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import ToolsHubClient from './page-client'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  const dict = await getDictionary(locale)
  
  const metadata = generateSeoMetadata({
    title: 'Free AI Design Tools - Poster, Cover & Banner Makers | CoverGen Pro',
    description: 'Professional design tools for every need. Create anime posters, event covers, book covers, game art, and more with AI. All tools are free with no watermark.',
    keywords: [
      'free design tools',
      'ai poster maker',
      'cover design tools',
      'banner maker free',
      'anime poster maker',
      'book cover creator',
      'event poster designer',
      'game cover art maker',
      'music album cover',
      'social media poster maker',
      'webinar poster maker',
      'bilibili video cover',
      'spotify playlist cover',
      'facebook event cover',
      'ai design tools free',
      'online cover maker',
      'thumbnail maker',
      'cover generator',
      'poster generator',
      'banner generator'
    ],
    path: '/tools',
    locale,
    searchParams,
  })
  
  return metadata
}

export default async function ToolsHubPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)
  
  return (
    <ClientBoundary>
      <ToolsHubClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}