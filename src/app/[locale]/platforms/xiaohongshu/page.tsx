import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import XiaohongshuCoverMakerClient from './page-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Xiaohongshu (小红书) Cover Maker - AI Cover Generator',
  description: 'Create stunning Xiaohongshu/Little Red Book covers and post images with AI. Perfect for lifestyle, beauty, fashion, and travel content that gets discovered.',
  keywords: [
    'Xiaohongshu cover maker',
    '小红书封面制作',
    'Little Red Book cover generator',
    'RedNote cover creator',
    'Xiaohongshu post design',
    'lifestyle cover maker',
    'beauty post generator',
    'fashion cover design',
    'travel post creator',
    'Chinese social media graphics'
  ],
  openGraph: {
    title: 'Xiaohongshu Cover Maker - CoverGen AI',
    description: 'Create eye-catching Xiaohongshu covers that boost engagement. AI-powered designs for lifestyle, beauty, and fashion content.',
    images: ['/xiaohongshu-cover-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/platforms/xiaohongshu',
  },
}

export default async function XiaohongshuCoverMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return <XiaohongshuCoverMakerClient locale={locale} translations={dict} />
}