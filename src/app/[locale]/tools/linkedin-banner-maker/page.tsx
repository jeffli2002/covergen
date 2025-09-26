import { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import LinkedInBannerMakerClient from './page-client'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const title = (locale as string) === 'zh' 
    ? 'LinkedIn 横幅制作工具 - 创建专业的个人品牌封面' 
    : 'LinkedIn Banner Maker - Create Professional Profile Headers'
  
  const description = (locale as string) === 'zh'
    ? '免费制作专业的 LinkedIn 个人资料横幅。完美尺寸 1584x396px，提升您的职业形象，吸引更多商业机会。'
    : 'Create professional LinkedIn profile banners free. Perfect 1584x396px size to enhance your professional image and attract more business opportunities.'

  return {
    title,
    description,
    keywords: 'linkedin banner maker, linkedin header maker, linkedin cover image generator, linkedin profile banner, professional banner maker, business header creator, linkedin background image, career banner design',
    openGraph: {
      title,
      description,
      type: 'website',
      images: ['/og-linkedin-banner.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-linkedin-banner.png'],
    },
    alternates: {
      canonical: `/tools/linkedin-banner-maker`,
      languages: {
        'en': '/en/tools/linkedin-banner-maker',
        'zh': '/zh/tools/linkedin-banner-maker',
      },
    },
  }
}

export default async function LinkedInBannerMakerPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)
  
  return <LinkedInBannerMakerClient locale={params.locale} translations={dict} />
}