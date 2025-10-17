import HomePageClient from './page-client'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import { Metadata } from 'next'
import { generateMetadata as createMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  const { locale } = await params
  const metadata = createMetadata({
    title: 'CoverGen.pro | AI Image & Video Generator – Nano Banana & Sora 2',
    description: 'Create AI images, posters, covers & videos instantly. Powered by Nano Banana & Sora 2. Free, no login. Perfect for creators, brands & marketers.',
    keywords: [
      'ai image generator',
      'ai video generator',
      'nano banana',
      'sora 2',
      'ai poster maker',
      'ai cover generator',
      'ai thumbnail generator',
      'ai ad creator',
      'ai design tool',
      'ai content creator',
      'ai social media tool',
      'free ai generator',
      'ai image video tool',
      'ai art creator',
      'ai marketing visuals'
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
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  
  return (
    <HomePageClient 
      locale={locale} 
      translations={dict}
    />
  )
}