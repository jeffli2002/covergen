import ClientBoundary from '@/components/client-boundary'

import WattpadCoverMakerClient from './page-client'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wattpad Cover Maker - Create Story Covers | CoverGen Pro',
  description: 'Design stunning Wattpad story covers with AI. Perfect 512x800 dimensions for maximum reader engagement. Create covers that attract readers to your stories.',
  keywords: 'wattpad cover maker, wattpad story cover, novel cover design, fanfiction cover, wattpad book cover',
  openGraph: {
    title: 'Wattpad Cover Maker - AI-Powered Design | CoverGen Pro',
    description: 'Create eye-catching Wattpad covers that get your stories noticed. Perfect dimensions and designs.',
    type: 'website',
  },
}

export default async function WattpadCoverMakerPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)

  return (
    <ClientBoundary>
      <WattpadCoverMakerClient locale={params.locale} translations={dict} />
    </ClientBoundary>
  )
}