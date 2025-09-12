import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import PrivacyPageClient from './page-client'

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