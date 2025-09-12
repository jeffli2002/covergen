import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import WeChatCoverMakerClient from './page-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WeChat Moments & Article Cover Maker - AI Generator',
  description: 'Create engaging WeChat Moments covers and official account article headers with AI. Perfect for brands and content creators in the Chinese market.',
  keywords: [
    'WeChat cover maker',
    '微信封面制作',
    'WeChat Moments cover',
    'WeChat article header',
    'WeChat official account',
    '微信公众号封面',
    'WeChat marketing graphics',
    'Chinese social media design',
    'WeChat brand content',
    'WeChat post creator'
  ],
  openGraph: {
    title: 'WeChat Graphics Maker - CoverGen AI',
    description: 'Create professional WeChat covers for Moments and official accounts. AI-powered designs for the Chinese market.',
    images: ['/wechat-cover-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/platforms/wechat',
  },
}

export default async function WeChatCoverMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <WeChatCoverMakerClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}