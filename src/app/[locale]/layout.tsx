import { Providers } from '@/components/providers'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { i18n, Locale } from '@/lib/i18n/config'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/Footer'
import MobileHeader from '@/components/mobile-header'
import AuthModalHandler from '@/components/auth/AuthModalHandler'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/toaster'

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale: locale.code }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  
  return (
    <ErrorBoundary>
      <Providers>
        <div className="min-h-screen flex flex-col">
          {/* Auth Modal Handler */}
          <AuthModalHandler />
          
          {/* Desktop Header */}
          <Header locale={locale} translations={dict} />
          
          {/* Mobile Header */}
          <MobileHeader />
          
          {/* Main Content with flex-grow to fill remaining space */}
          <main className="flex-1 flex flex-col">
            {/* Content wrapper with minimum height */}
            <div className="flex-1 min-h-[calc(100vh-4rem-20rem)]">
              {children}
            </div>
          </main>
          
          {/* Footer Container - estimated height to prevent jump */}
          <div className="min-h-[20rem]">
            <Footer locale={locale} translations={dict} />
          </div>
        </div>
        
        {/* Toast Notifications */}
        <Toaster />
      </Providers>
    </ErrorBoundary>
  )
}