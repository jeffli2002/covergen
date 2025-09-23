import SimpleHomePage from './page-simple'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'

export default async function HomePage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)
  
  return (
    <SimpleHomePage 
      locale={params.locale} 
      translations={dict}
    />
  )
}