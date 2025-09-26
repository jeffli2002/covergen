import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import TikTokCoverMakerClient from './page-client'
import { Metadata } from 'next'
import ClientBoundary from '@/components/client-boundary'
import { generatePlatformMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  const metadata = generatePlatformMetadata('tiktok', locale, searchParams)
  
  // Override with TikTok-specific optimizations
  return {
    ...metadata,
    title: 'TikTok Cover Maker - AI Video Cover Generator | CoverGen Pro',
    description: 'Create viral TikTok covers that boost engagement. AI-powered vertical cover generation optimized for TikTok\'s algorithm and Gen-Z aesthetics.',
    keywords: [
      'TikTok cover maker',
      'TikTok thumbnail maker',
      'TikTok thumbnail generator',
      'TikTok cover creator',
      'TikTok poster maker',
      'TikTok cover image generator',
      'TikTok thumbnail designer',
      'TikTok poster image maker',
      'tiktok thumbnail maker',
      'TikTok video cover',
      'vertical video thumbnail',
      'TikTok cover design',
      'TikTok thumbnail size',
      'viral TikTok covers',
      'TikTok cover templates',
      'mobile video covers',
      'TikTok content creator tools',
      'TikTok story cover maker',
      'TikTok banner maker',
      'TikTok profile cover',
      'free TikTok cover maker',
      'TikTok cover no watermark'
    ].join(', '),
  }
}

export default async function TikTokCoverMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <TikTokCoverMakerClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}