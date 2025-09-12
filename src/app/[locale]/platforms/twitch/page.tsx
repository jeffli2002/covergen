import ClientBoundary from '@/components/client-boundary'

import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import TwitchGraphicsMakerClient from './page-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Twitch Stream Overlay & Banner Maker - AI Generator',
  description: 'Create professional Twitch overlays, banners, and panels with AI. Boost your stream aesthetics and grow your channel with eye-catching graphics.',
  keywords: [
    'Twitch overlay maker',
    'Twitch banner generator',
    'Twitch panel maker',
    'stream overlay creator',
    'Twitch graphics generator',
    'Twitch offline banner',
    'Twitch profile banner',
    'stream design tools',
    'Twitch branding',
    'streaming graphics'
  ],
  openGraph: {
    title: 'Twitch Graphics Maker - CoverGen AI',
    description: 'Create stunning Twitch graphics that make your stream stand out. AI-powered overlays, banners, and panels.',
    images: ['/twitch-graphics-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/platforms/twitch',
  },
}

export default async function TwitchGraphicsMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <TwitchGraphicsMakerClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}