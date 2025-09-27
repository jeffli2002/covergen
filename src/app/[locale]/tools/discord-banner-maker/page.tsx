import ClientBoundary from '@/components/client-boundary'

import DiscordBannerMakerClient from './page-client'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discord Banner Maker - Create Server & Profile Banners | CoverGen Pro',
  description: 'Design eye-catching Discord banners with AI. Perfect dimensions for server banners (960x540) and profile banners. Build stronger communities.',
  keywords: 'discord banner maker, discord server banner maker, discord banner generator, discord header creator, discord banner dimensions, discord server banner, discord profile banner, discord banner size, free discord banner maker, discord banner templates',
  openGraph: {
    title: 'Discord Banner Maker - AI-Powered Design | CoverGen Pro',
    description: 'Create engaging Discord banners that make your server stand out. Perfect dimensions and designs.',
    type: 'website',
  },
}

export default async function DiscordBannerMakerPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)

  return (
    <ClientBoundary>
      <DiscordBannerMakerClient locale={params.locale} translations={dict} />
    </ClientBoundary>
  )
}