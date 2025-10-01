import ClientBoundary from '@/components/client-boundary'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import TermsPageClient from './page-client'

export const metadata: Metadata = {
  title: 'Terms of Service - CoverGen AI',
  description: 'Terms of service for CoverGen AI cover generator. Read our terms and conditions for using our AI-powered design platform.',
  keywords: [
    'terms of service',
    'terms and conditions',
    'user agreement',
    'legal terms',
    'service agreement',
    'usage terms',
    'sora 2 terms',
    'sora 2 usage',
    'ai service terms'
  ],
  openGraph: {
    title: 'CoverGen AI Terms of Service',
    description: 'Terms and conditions for using CoverGen AI services.',
    images: ['/terms-og.jpg'],
  },
}

export default async function TermsPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <TermsPageClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}