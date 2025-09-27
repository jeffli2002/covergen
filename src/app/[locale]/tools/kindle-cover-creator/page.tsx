import ClientBoundary from '@/components/client-boundary'

import KindleCoverCreatorClient from './page-client'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kindle Cover Creator - Design Professional eBook Covers | CoverGen Pro',
  description: 'Create stunning Kindle book covers with AI. Perfect 1600x2560 dimensions for Amazon KDP. Genre-specific designs that boost book sales.',
  keywords: 'kindle cover creator, kindle book cover maker, amazon kdp cover, ebook cover design, kindle cover dimensions, kindle cover size, self publishing cover, kdp cover generator, kindle cover template, free kindle cover maker',
  openGraph: {
    title: 'Kindle Cover Creator - AI-Powered Book Design | CoverGen Pro',
    description: 'Design professional Kindle covers that sell. Perfect dimensions and genre-specific designs.',
    type: 'website',
  },
}

export default async function KindleCoverCreatorPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)

  return (
    <ClientBoundary>
      <KindleCoverCreatorClient locale={params.locale} translations={dict} />
    </ClientBoundary>
  )
}