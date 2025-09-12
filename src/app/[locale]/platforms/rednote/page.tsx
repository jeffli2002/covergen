import ClientBoundary from '@/components/client-boundary'

import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import RednoteCoverMakerClient from './page-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rednote (小红书) Cover Maker - AI Cover Generator',
  description: 'Create stunning Rednote (小红书) covers and post images with AI. Perfect for lifestyle, beauty, fashion, and travel content that gets discovered.',
  keywords: [
    'Rednote cover maker',
    '小红书封面制作',
    'Rednote cover generator',
    'RedNote cover creator',
    'Rednote post design',
    'lifestyle cover maker',
    'beauty post generator',
    'fashion cover design',
    'travel post creator',
    'Chinese social media graphics'
  ],
  openGraph: {
    title: 'Rednote Cover Maker - CoverGen AI',
    description: 'Create eye-catching Rednote covers that boost engagement. AI-powered designs for lifestyle, beauty, and fashion content.',
    images: ['/rednote-cover-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/platforms/rednote',
  },
}

export default async function RednoteCoverMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <RednoteCoverMakerClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}