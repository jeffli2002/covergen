import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import HomePageClient from './page-client'

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return <HomePageClient locale={locale} translations={dict} />
}