import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import TermsPageClient from './page-client'

export default async function TermsPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return <TermsPageClient locale={locale} translations={dict} />
}