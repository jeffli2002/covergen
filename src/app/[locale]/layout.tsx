import { Providers } from '@/components/providers'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Locale } from '@/lib/i18n/config'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/Footer'
import MobileHeader from '@/components/mobile-header'

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
      <div className="min-h-screen bg-background">
        {/* Desktop Header */}
        <Header locale={params.locale} translations={dict} />
        
        {/* Mobile Header */}
        <MobileHeader />
        
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* Footer */}
        <Footer locale={params.locale} translations={dict} />
      </div>
    </Providers>
  )
}