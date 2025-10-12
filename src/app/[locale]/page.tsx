import HomePageClient from './page-client'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import { Metadata } from 'next'
import { generateMetadata as createMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  const metadata = createMetadata({
    title: 'CoverGen.pro | AI Image & Video Generator – Nano Banana & Sora 2',
    description: 'Create AI images, posters, covers & videos instantly. Powered by Nano Banana & Sora 2. Free, no login. Perfect for creators, brands & marketers.',
    keywords: [
      // NEW: Primary keywords from user request (2025-10-12)
      'ai image generator',
      'ai video generator',
      'nano banana',
      'sora 2',
      'gemini 2.5 flash image',
      'ai image generation',
      'ai video generation',
      'ai thumbnail generator',
      'ai poster generator',
      'ai cover generator',
      'ai ad creator',
      'ai design tool',
      'ai content creation',
      'ai creative tool',
      'ai art generator',
      'ai marketing visuals',
      'ai video maker',
      'ai social media design',
      'free ai generator',
      'ai for content creators',
      'ai image and video tool',
      'ai graphic generator',
      'ai animation',
      'ai poster design',
      'ai youtube thumbnail',
      'ai tiktok cover',
      'ai twitter banner',
      'ai linkedin post image',
      
      // EXISTING: Primary keywords
      'ai cover generator',
      'free thumbnail maker',
      'cover generator',
      'thumbnail generator',
      'ai thumbnail maker',
      'free cover maker',
      'thumbnail maker no watermark',
      'ai design tool',
      
      // EXISTING: Platform-specific
      'youtube thumbnail maker',
      'tiktok cover generator',
      'spotify cover maker',
      'instagram post maker',
      'twitch thumbnail creator',
      
      // EXISTING: Feature keywords
      'cover maker free',
      'online cover generator',
      'ai poster maker',
      'social media cover maker',
      'professional cover design',
      'instant cover generator',
      
      // EXISTING: Brand keywords
      'covergen pro',
      'covergen ai',
      'cover generation tool',
      
      // EXISTING: Sora 2 keywords
      'sora 2 cover generator',
      'sora 2 thumbnail maker',
      'sora 2 ai integration',
      'sora 2 video covers',
      'sora 2 content creation'
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