import HomePageClient from './page-client'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import { Metadata } from 'next'
import { generateMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  const metadata = generateMetadata({
    title: 'AI Cover Generator - Free Thumbnail Maker | CoverGen Pro',
    description: 'Create stunning covers and thumbnails for YouTube, TikTok, Spotify, and more with AI. Free cover generator with no watermark. Professional designs in seconds.',
    keywords: [
      // Primary keywords
      'ai cover generator',
      'free thumbnail maker',
      'cover generator',
      'thumbnail generator',
      'ai thumbnail maker',
      'free cover maker',
      'thumbnail maker no watermark',
      'ai design tool',
      
      // Platform-specific
      'youtube thumbnail maker',
      'tiktok cover generator',
      'spotify cover maker',
      'instagram post maker',
      'twitch thumbnail creator',
      
      // Feature keywords
      'cover maker free',
      'online cover generator',
      'ai poster maker',
      'social media cover maker',
      'professional cover design',
      'instant cover generator',
      
      // Brand keywords
      'covergen pro',
      'covergen ai',
      'cover generation tool'
    ],
    path: '/',
    locale,
    searchParams,
    images: [{
      url: 'https://covergen.pro/logo.png',
      width: 1200,
      height: 630,
      alt: 'CoverGen Pro - AI-Powered Cover & Thumbnail Generator',
    }],
  })
  
  return metadata
}

export default async function HomePage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)
  
  return (
    <HomePageClient 
      locale={params.locale} 
      translations={dict}
    />
  )
}