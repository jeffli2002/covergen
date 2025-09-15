import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { i18n, type Locale } from '@/lib/i18n/config'
import { Providers } from '@/components/providers'
import '@/app/globals.css'

// export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale: locale.code }))
}

export const metadata: Metadata = {
  title: 'CoverGen - AI Cover Generator',
  description: 'Generate stunning covers with AI',
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: Locale }
}) {
  // Validate locale
  const isValidLocale = i18n.locales.some((l) => l.code === locale)
  if (!isValidLocale) notFound()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}