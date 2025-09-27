import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import ThumbnailTesterClient from './page-client'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const title = (locale as string) === 'zh' 
    ? '缩略图测试器 - 预览和优化您的缩略图' 
    : 'Thumbnail Tester - Preview & Optimize Your Thumbnails'
  
  const description = (locale as string) === 'zh'
    ? '测试您的缩略图在YouTube、TikTok等平台的显示效果。预览不同尺寸，比较点击率，优化您的缩略图设计。'
    : 'Test how your thumbnails look on YouTube, TikTok, and other platforms. Preview different sizes, compare CTR potential, and optimize your thumbnail designs.'

  return {
    title,
    description,
    keywords: 'thumbnail tester, thumbnail preview, youtube thumbnail tester, thumbnail checker, thumbnail analyzer, ctr optimizer, thumbnail comparison tool, thumbnail preview tool, thumbnail sketch, youtube thumbnail preview, thumbnail performance tester',
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['/og-thumbnail-tester.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-thumbnail-tester.png'],
    },
    alternates: {
      canonical: `/tools/thumbnail-tester`,
      languages: {
        'en': '/en/tools/thumbnail-tester',
        'zh': '/zh/tools/thumbnail-tester',
      },
    },
  }
}

export default async function ThumbnailTesterPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)
  
  return <ThumbnailTesterClient locale={params.locale} translations={dict} />
}