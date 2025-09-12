import ClientBoundary from '@/components/client-boundary'

import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import CookiesPageClient from './page-client'

export default async function CookiesPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <CookiesPageClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}