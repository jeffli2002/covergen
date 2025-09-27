import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import ThumbnailMakerHubClient from './page-client'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const title = (locale as string) === 'zh' 
    ? '缩略图制作器中心 - 所有AI封面和缩略图工具' 
    : 'Thumbnail Maker Hub - All AI Cover & Thumbnail Tools'
  
  const description = (locale as string) === 'zh'
    ? '探索我们完整的AI缩略图和封面制作工具集合。为YouTube、TikTok、Spotify、播客等平台创建专业图像。'
    : 'Explore our complete collection of AI thumbnail and cover makers. Create professional images for YouTube, TikTok, Spotify, podcasts, and more platforms.'

  return {
    title,
    description,
    keywords: 'thumbnail maker, cover maker, thumbnail generator, cover generator, youtube thumbnail maker, tiktok thumbnail, spotify cover maker, podcast cover maker, ai thumbnail generator, free thumbnail maker, thumbnail maker no watermark, gaming thumbnail maker, fortnite thumbnail, minecraft thumbnail, thumbnail tester, thumbnail preview, thumbnail sketch, youtube thumbnail grabber, youtube thumbnail resizer, album art generator, ai album art generator, book cover maker, wattpad cover maker, discord banner maker, linkedin banner maker, instagram thumbnail maker, twitter header maker, facebook cover maker, poster maker, ai poster generator',
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['/og-thumbnail-hub.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-thumbnail-hub.png'],
    },
    alternates: {
      canonical: `/tools/thumbnail-maker-hub`,
      languages: {
        'en': '/en/tools/thumbnail-maker-hub',
        'zh': '/zh/tools/thumbnail-maker-hub',
      },
    },
  }
}

export default async function ThumbnailMakerHubPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)
  
  return <ThumbnailMakerHubClient locale={params.locale} translations={dict} />
}