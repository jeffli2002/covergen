import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { i18n, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/Footer'
import { Analytics } from '@vercel/analytics/react'
import { Providers } from '@/components/providers'
import { organizationSchema, websiteSchema, softwareApplicationSchema } from '@/lib/seo/schema'
import { Suspense, lazy } from 'react'
import { SessionRecovery } from '@/components/auth/SessionRecovery'
import '@/app/globals.css'

// Lazy load performance monitor for development
const PerformanceMonitor = lazy(() => import('@/components/seo/PerformanceMonitorV2'))

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
    description: `${dict.common.description} Powered by Google Gemini 2.5 Flash (Nano Banana) - the latest and powerful AI image generation model. This platform is independent and not affiliated with Google.`,
    keywords: [
      // Core keywords
      'cover',
      'cover image',
      'cover maker',
      'cover image generator',
      'thumbnail',
      'thumbnail maker',
      'thumbnail maker',
      'youtube thumbnail maker',
      'youtube thumbnail maker',
      'youtube cover maker',
      'poster',
      'poster maker',
      'poster image maker',
      'poster image generator',
      'tiktok thumbnail maker',
      
      // AI and Technology
      'AI cover generator',
      'AI thumbnail maker',
      'AI poster generator',
      'AI design tool',
      'content creator tools',
      'social media covers',
      'nano banana',
      'Google Gemini 2.5 Flash',
      'Gemini Flash AI',
      'AI thumbnail generator',
      'cover image maker',
      'social media thumbnail creator',
      'AI-powered design',
      'instant cover generation',
      'multi-platform cover creator',
      'professional cover design',
      'cover art generator',
      'thumbnail template maker',
      'AI cover art',
      'cover design software',
    ],
    authors: [{ name: 'CoverGen AI Team' }],
    creator: 'CoverGen AI',
    publisher: 'CoverGen AI',
    openGraph: {
      type: 'website',
      locale: locale,
      url: `https://covergen.pro/${locale}`,
      title: `${dict.common.appName} - ${dict.common.tagline}`,
      description: dict.common.description,
      siteName: dict.common.appName,
      images: [
        {
          url: 'https://covergen.pro/og-image.png',
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
      images: ['https://covergen.pro/twitter-image.png'],
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
      canonical: `https://covergen.pro/${locale}`,
      languages: Object.fromEntries(
        i18n.locales.map((l) => [
          l.code,
          `https://covergen.pro/${l.code}`,
        ])
      ),
    },
    other: {
      'google-adsense-account': 'ca-pub-9378191378774896',
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
  const dir = 'ltr'

  // Combine all global schemas
  const globalSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      websiteSchema,
      softwareApplicationSchema,
    ],
  }

  return (
    <>
      <Script
        id="set-html-attrs"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            document.documentElement.lang = '${locale}';
            document.documentElement.dir = '${dir}';
            document.documentElement.className = '${inter.className}';
          `,
        }}
      />
      <Script
        id="structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
      />
      <Providers>
        <SessionRecovery />
        <div className={`min-h-screen flex flex-col ${inter.className}`}>
          <Header locale={locale} translations={dict} />
          <main className="flex-grow">
            {children}
          </main>
          <Footer locale={locale} translations={dict} />
        </div>
        <Analytics />
        
        {/* Performance Monitor - Development only */}
        <Suspense fallback={null}>
          <PerformanceMonitor 
            enabled={process.env.NODE_ENV === 'development'} 
            showDebug={false}
          />
        </Suspense>
      </Providers>
    </>
  )
}