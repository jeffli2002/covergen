import ClientBoundary from '@/components/client-boundary'

import RefundPageClient from './page-client'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy - CoverGen Pro',
  description: 'All sales are final. Pro/Pro+ plans include a free trial. Learn about our sales policy and billing error corrections.',
  openGraph: {
    title: 'Refund Policy - CoverGen Pro',
    description: 'Digital service with no refunds. Try Pro/Pro+ risk-free with our trial period.',
  },
}

export default async function RefundPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)

  return (
    <ClientBoundary>
      <RefundPageClient locale={params.locale} translations={dict} />
    </ClientBoundary>
  )
}