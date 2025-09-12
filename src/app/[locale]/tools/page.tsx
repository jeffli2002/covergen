import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import ToolsHubClient from './page-client'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const dict = await getDictionary(locale)
  
  const title = 'Free AI Design Tools - Poster, Cover & Banner Makers'
  const description = 'Professional design tools for every need. Create anime posters, event covers, book covers, game art, and more with AI. All tools are free with no watermark.'
  
  return {
    title,
    description,
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
      'online cover maker'
    ].join(', '),
    openGraph: {
      title,
      description,
      url: `https://covergen.pro/${locale}/tools`,
      siteName: 'CoverGen Pro',
      images: [
        {
          url: 'https://covergen.pro/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Free AI Design Tools',
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
      canonical: `https://covergen.pro/${locale}/tools`,
      languages: {
        'en': '/en/tools',
        'es': '/es/tools',
        'pt': '/pt/tools',
        'zh': '/zh/tools',
        'ar': '/ar/tools',
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