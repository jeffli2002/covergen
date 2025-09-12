import ClientBoundary from '@/components/client-boundary'

import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import FeedbackPageClient from './page-client'

export default async function FeedbackPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <FeedbackPageClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}