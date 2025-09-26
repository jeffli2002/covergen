import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import AIThumbnailGeneratorClient from './page-client'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const title = (locale as string) === 'zh' 
    ? '免费 AI 缩略图生成器 - 智能创建专业封面图' 
    : 'AI Thumbnail Generator Free - Create Professional Covers with AI'
  
  const description = (locale as string) === 'zh'
    ? '使用先进的 AI 技术免费生成专业缩略图。支持 YouTube、TikTok、Instagram 等平台，无需设计经验，一键生成吸引人的封面。'
    : 'Generate professional thumbnails free with advanced AI technology. Perfect for YouTube, TikTok, Instagram and more. No design skills needed - create engaging covers instantly.'

  return {
    title,
    description,
    keywords: 'ai thumbnail generator free, free ai thumbnail maker, ai cover generator, artificial intelligence thumbnail, ai youtube thumbnail, ai thumbnail creator no watermark, automatic thumbnail generator, ai powered thumbnail maker',
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['/og-ai-thumbnail.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-ai-thumbnail.png'],
    },
    alternates: {
      canonical: `/tools/ai-thumbnail-generator-free`,
      languages: {
        'en': '/en/tools/ai-thumbnail-generator-free',
        'zh': '/zh/tools/ai-thumbnail-generator-free',
      },
    },
  }
}

export default async function AIThumbnailGeneratorPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)
  
  return <AIThumbnailGeneratorClient locale={params.locale} translations={dict} />
}