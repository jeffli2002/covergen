import ClientBoundary from '@/components/client-boundary'

import FacebookEventCoverClient from './page-client'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  return generateToolMetadata('facebook-event-cover', locale, searchParams)
}

export default async function FacebookEventCoverPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)

  return (
    <ClientBoundary>
      <FacebookEventCoverClient locale={params.locale} translations={dict} />
    </ClientBoundary>
  )
}