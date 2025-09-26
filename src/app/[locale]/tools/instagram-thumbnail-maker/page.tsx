import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import InstagramThumbnailMakerClient from './page-client'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const title = (locale as string) === 'zh' 
    ? 'Instagram 缩略图制作工具 - 免费创建精美 Reels 封面' 
    : 'Instagram Thumbnail Maker - Create Stunning Reels Covers Free'
  
  const description = (locale as string) === 'zh'
    ? '使用我们的免费 Instagram 缩略图制作工具，轻松创建吸引人的 Reels、Feed 和 Story 封面。专为 Instagram 优化的尺寸和模板。'
    : 'Create eye-catching Instagram thumbnails for Reels, Feed posts, and Stories with our free Instagram thumbnail maker. Optimized sizes and templates for maximum engagement.'

  return {
    title,
    description,
    keywords: 'instagram thumbnail maker, instagram reels thumbnail, instagram cover maker, instagram feed preview, instagram story cover, free instagram thumbnail generator, instagram post thumbnail, instagram reel cover maker',
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['/og-instagram-thumbnail.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-instagram-thumbnail.png'],
    },
    alternates: {
      canonical: `/tools/instagram-thumbnail-maker`,
      languages: {
        'en': '/en/tools/instagram-thumbnail-maker',
        'zh': '/zh/tools/instagram-thumbnail-maker',
      },
    },
  }
}

export default async function InstagramThumbnailMakerPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)
  
  return <InstagramThumbnailMakerClient locale={params.locale} translations={dict} />
}