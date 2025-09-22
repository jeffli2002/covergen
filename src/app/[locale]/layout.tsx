import { Providers } from '@/components/providers'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { i18n, Locale } from '@/lib/i18n/config'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/Footer'
import MobileHeader from '@/components/mobile-header'

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale: locale.code }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)
  
  return (
    <Providers>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header Container with fixed height to prevent jumping */}
        <div className="h-16 lg:h-16">
          {/* Desktop Header */}
          <Header locale={params.locale} translations={dict} />
          
          {/* Mobile Header */}
          <MobileHeader />
        </div>
        
        {/* Main Content with flex-grow to fill remaining space */}
        <main className="flex-1 flex flex-col">
          {/* Content wrapper with minimum height */}
          <div className="flex-1 min-h-[calc(100vh-4rem-20rem)]">
            {children}
          </div>
        </main>
        
        {/* Footer Container - estimated height to prevent jump */}
        <div className="min-h-[20rem]">
          <Footer locale={params.locale} translations={dict} />
        </div>
      </div>
    </Providers>
  )
}