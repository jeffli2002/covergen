import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import BilibiliCoverClient from './page-client'
import { getHighOpportunityKeywords } from '@/lib/seo/keyword-merger'

// Get optimized keywords for this page
const keywords = [
  'bilibili cover maker',
  'bilibili thumbnail maker',
  'bilibili video cover',
  'B站封面制作器',
  'B站缩略图制作器',
  'bilibili cover generator',
  'bilibili poster maker',
  'B站海报制作器',
  'bilibili video thumbnail',
  'chinese video cover maker',
  'bilibili cover design',
  'B站封面设计',
  'bilibili cover creator',
  'bilibili cover art',
  'bilibili channel cover',
  ...getHighOpportunityKeywords().slice(0, 5).map(k => k.keyword)
]

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const dict = await getDictionary(locale)
  
  const title = 'Bilibili Video Cover Maker - AI Cover Generator for B站'
  const description = 'Create stunning Bilibili video covers with AI-powered generation. Perfect 16:10 aspect ratio optimized for B站 platform. Support for anime, gaming, and vlog styles.'
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url: `https://covergen.pro/${locale}/platforms/bilibili`,
      siteName: 'CoverGen Pro',
      images: [
        {
          url: 'https://covergen.pro/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Bilibili Video Cover Maker',
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
      canonical: `https://covergen.pro/${locale}/platforms/bilibili`,
      languages: {
        'en': '/en/platforms/bilibili',
        'zh': '/zh/platforms/bilibili',
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

export default async function BilibiliVideoCoverPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)
  
  return (
    <ClientBoundary>
      <BilibiliCoverClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}