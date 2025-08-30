import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://covergen.ai'),
  title: {
    default: 'CoverGen AI - AI-Powered Cover & Poster Generator for Content Creators',
    template: '%s | CoverGen AI'
  },
  description: 'Create stunning YouTube thumbnails, Twitch overlays, TikTok covers, Spotify album art, and more with AI. Save 70% time with professional cover generation for all social media platforms.',
  keywords: [
    'AI cover generator',
    'YouTube thumbnail maker',
    'Twitch overlay creator',
    'TikTok cover design',
    'Spotify album art generator',
    'Bilibili cover maker',
    'Xiaohongshu poster creator',
    'social media cover design',
    'AI thumbnail generator',
    'content creator tools',
    'automatic cover generation',
    'professional thumbnail maker',
    'poster maker online',
    'social media graphics',
    'AI design tools'
  ],
  authors: [{ name: 'CoverGen AI Team' }],
  creator: 'CoverGen AI',
  publisher: 'CoverGen AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'CoverGen AI - AI-Powered Cover Generator for Content Creators',
    description: 'Create stunning covers for YouTube, Twitch, TikTok, Spotify & more in seconds. Save 70% of your design time with AI-powered generation.',
    url: 'https://covergen.ai',
    siteName: 'CoverGen AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CoverGen AI - Professional Cover Generation for All Platforms',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoverGen AI - AI Cover Generator for Content Creators',
    description: 'Create stunning covers for all social media platforms in seconds with AI',
    creator: '@covergenai',
    images: ['/twitter-image.jpg'],
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
    canonical: 'https://covergen.ai',
    languages: {
      'en-US': 'https://covergen.ai',
      'zh-CN': 'https://covergen.ai/zh',
      'ja-JP': 'https://covergen.ai/ja',
      'ko-KR': 'https://covergen.ai/ko',
    },
  },
  category: 'technology',
  classification: 'SaaS, Design Tools, AI Software',
  applicationName: 'CoverGen AI',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'light',
  themeColor: '#3B82F6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CoverGen AI',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '29.99',
      offerCount: '3'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2547',
      bestRating: '5',
      worstRating: '1'
    },
    description: 'AI-powered cover and poster generator for content creators. Generate professional covers for YouTube, Twitch, TikTok, Spotify, and more in seconds.',
    screenshot: 'https://covergen.ai/screenshot.jpg',
    featureList: [
      'AI-powered cover generation',
      'Multi-platform support (YouTube, Twitch, TikTok, Spotify, etc.)',
      'Professional templates',
      'Instant generation in under 10 seconds',
      'Commercial usage rights',
      'Brand consistency tools'
    ],
    creator: {
      '@type': 'Organization',
      name: 'CoverGen AI',
      url: 'https://covergen.ai'
    }
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CoverGen AI',
    url: 'https://covergen.ai',
    logo: 'https://covergen.ai/logo.png',
    description: 'Professional AI-powered cover generation platform for content creators',
    sameAs: [
      'https://twitter.com/covergenai',
      'https://www.linkedin.com/company/covergenai',
      'https://www.youtube.com/@covergenai'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'customer support',
      email: 'support@covergen.ai',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Chinese', 'Japanese', 'Korean']
    }
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CoverGen AI',
    url: 'https://covergen.ai',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://covergen.ai/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <div id="modal-root"></div>
      </body>
    </html>
  )
}