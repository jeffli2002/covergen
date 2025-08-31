import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { i18n, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Analytics } from '@vercel/analytics/react'
import { Providers } from '@/components/providers'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale: locale.code }))
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const dict = await getDictionary(locale)
  const localeInfo = i18n.locales.find(l => l.code === locale)

  return {
    title: {
      default: `${dict.common.appName} - ${dict.common.tagline}`,
      template: `%s | ${dict.common.appName}`,
    },
    description: dict.common.description,
    keywords: [
      'AI cover generator',
      'YouTube thumbnail maker',
      'TikTok cover creator',
      'Spotify cover art',
      'poster design',
      'AI design tool',
      'content creator tools',
      'social media covers',
    ],
    authors: [{ name: 'CoverGen AI Team' }],
    creator: 'CoverGen AI',
    publisher: 'CoverGen AI',
    openGraph: {
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'pt' ? 'pt_BR' : locale,
      url: `https://covergen.ai/${locale}`,
      title: `${dict.common.appName} - ${dict.common.tagline}`,
      description: dict.common.description,
      siteName: dict.common.appName,
      images: [
        {
          url: 'https://covergen.ai/og-image.png',
          width: 1200,
          height: 630,
          alt: dict.common.appName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${dict.common.appName} - ${dict.common.tagline}`,
      description: dict.common.description,
      images: ['https://covergen.ai/twitter-image.png'],
      creator: '@covergenai',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `https://covergen.ai/${locale}`,
      languages: Object.fromEntries(
        i18n.locales.map((l) => [
          l.code === 'zh' ? 'zh-CN' : l.code === 'pt' ? 'pt-BR' : l.code,
          `https://covergen.ai/${l.code}`,
        ])
      ),
    },
  }
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: Locale }
}) {
  // Validate locale
  const isValidLocale = i18n.locales.some((l) => l.code === locale)
  if (!isValidLocale) notFound()

  const dict = await getDictionary(locale)
  const localeInfo = i18n.locales.find(l => l.code === locale)
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header locale={locale} translations={dict} />
            <main className="flex-grow">
              {children}
            </main>
            <Footer locale={locale} translations={dict} />
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}