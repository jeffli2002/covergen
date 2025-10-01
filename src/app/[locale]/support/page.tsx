import ClientBoundary from '@/components/client-boundary'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import SupportPageClient from './page-client'

export const metadata: Metadata = {
  title: 'Support - Help & Documentation',
  description: 'Get help with CoverGen AI. Find answers to common questions, contact support, or browse our documentation for cover generation assistance.',
  keywords: [
    'covergen support',
    'help center',
    'documentation',
    'faq',
    'contact support',
    'user guide',
    'troubleshooting',
    'assistance',
    'sora 2 support',
    'sora 2 help',
    'sora 2 documentation',
    'sora 2 troubleshooting',
    'sora 2 faq',
    'sora 2 guide'
  ],
  openGraph: {
    title: 'CoverGen AI Support - Get Help',
    description: 'Find help and documentation for using CoverGen AI cover generator.',
    images: ['/support-og.jpg'],
  },
}

export default async function SupportPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <SupportPageClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}