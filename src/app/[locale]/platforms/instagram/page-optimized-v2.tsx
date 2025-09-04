import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'
import { getLightweightKeywords, generateLightweightDescription } from '@/lib/seo/lightweight-keywords'
import InstagramOptimizedClient from './instagram-optimized-client'

// Lightweight metadata generation
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  // Use lightweight keywords for faster loading
  const keywords = getLightweightKeywords('instagram')
  const description = generateLightweightDescription('instagram')
  const title = 'Instagram Content Maker - Free AI Post & Story Generator | CoverGen Pro'
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url: `https://covergen.pro/${locale}/platforms/instagram`,
      siteName: 'CoverGen Pro',
      images: [
        {
          url: 'https://covergen.pro/og-instagram.webp', // Use WebP for OG images
          width: 1200,
          height: 630,
          alt: 'Instagram Content Maker - AI Powered',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://covergen.pro/twitter-instagram.webp'],
      creator: '@covergenai',
    },
    alternates: {
      canonical: `https://covergen.pro/${locale}/platforms/instagram`,
      languages: {
        'en': '/en/platforms/instagram',
        'es': '/es/platforms/instagram',
        'pt': '/pt/platforms/instagram',
        'zh': '/zh/platforms/instagram',
        'ar': '/ar/platforms/instagram',
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

export default async function InstagramOptimizedPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  // Only load essential data for initial render
  const dict = await getDictionary(locale)

  return <InstagramOptimizedClient locale={locale} translations={dict} />
}