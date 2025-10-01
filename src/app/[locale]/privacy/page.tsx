import ClientBoundary from '@/components/client-boundary'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import PrivacyPageClient from './page-client'

export const metadata: Metadata = {
  title: 'Privacy Policy - CoverGen AI',
  description: 'Privacy policy for CoverGen AI cover generator. Learn how we protect your data and respect your privacy when using our AI-powered design tools.',
  keywords: [
    'privacy policy',
    'data protection',
    'user privacy',
    'gdpr',
    'data security',
    'personal information',
    'sora 2 privacy',
    'sora 2 data protection',
    'ai privacy policy'
  ],
  openGraph: {
    title: 'CoverGen AI Privacy Policy',
    description: 'Our commitment to protecting your privacy and data.',
    images: ['/privacy-og.jpg'],
  },
}

export default async function PrivacyPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <PrivacyPageClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}