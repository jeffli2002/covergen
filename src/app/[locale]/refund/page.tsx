import RefundPageClient from './page-client'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy - CoverGen Pro',
  description: 'Learn about our refund policy, money-back guarantee, and how to request a refund for your CoverGen Pro subscription.',
  openGraph: {
    title: 'Refund Policy - CoverGen Pro',
    description: 'Our commitment to customer satisfaction: 7-day money-back guarantee and fair refund policies.',
  },
}

export default async function RefundPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)

  return <RefundPageClient locale={params.locale} translations={dict} />
}