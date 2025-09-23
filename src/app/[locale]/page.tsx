import HomePageClient from './page-client'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'

export default async function HomePage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)
  
  return (
    <HomePageClient 
      locale={params.locale} 
      translations={dict}
    />
  )
}