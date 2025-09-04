import { Metadata } from 'next'

export interface PlatformMetadataConfig {
  platform: string
  title: string
  description: string
  keywords: string[]
  locale: string
  ogImage?: string
  twitterImage?: string
}

export function generatePlatformMetadata(config: PlatformMetadataConfig): Metadata {
  const {
    platform,
    title,
    description,
    keywords,
    locale,
    ogImage = '/og-image.png',
    twitterImage = '/twitter-image.png'
  } = config

  const canonicalUrl = `https://covergen.pro/${locale}/platforms/${platform.toLowerCase()}`

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'CoverGen Pro',
      images: [
        {
          url: `https://covergen.pro${ogImage}`,
          width: 1200,
          height: 630,
          alt: `${platform} Cover Maker - AI Powered`,
          type: 'image/png',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`https://covergen.pro${twitterImage}`],
      creator: '@covergenai',
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `/en/platforms/${platform.toLowerCase()}`,
        'es': `/es/platforms/${platform.toLowerCase()}`,
        'pt': `/pt/platforms/${platform.toLowerCase()}`,
        'zh': `/zh/platforms/${platform.toLowerCase()}`,
        'ar': `/ar/platforms/${platform.toLowerCase()}`,
      },
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
    verification: {
      google: 'your-google-verification-code',
    },
    category: 'technology',
    classification: 'AI Tools, Image Generation, Content Creation',
    applicationName: 'CoverGen Pro',
    appLinks: {
      web: {
        url: canonicalUrl,
        should_fallback: true,
      },
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': 'CoverGen Pro',
      'format-detection': 'telephone=no',
      'msapplication-TileColor': '#7c3aed',
      'msapplication-tap-highlight': 'no',
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/png',
      'og:locale': locale,
      'og:locale:alternate': ['en', 'es', 'pt', 'zh', 'ar'].filter(l => l !== locale).join(','),
      'article:author': 'CoverGen Pro Team',
      'article:section': 'Technology',
      'article:tag': keywords.slice(0, 5).join(','),
    },
  }
}

// Platform-specific image optimization configurations
export const PLATFORM_IMAGE_CONFIGS = {
  youtube: {
    dimensions: { width: 1280, height: 720 },
    aspectRatio: '16/9',
    quality: 85,
    priority: true,
  },
  tiktok: {
    dimensions: { width: 1080, height: 1920 },
    aspectRatio: '9/16',
    quality: 85,
    priority: true,
  },
  instagram: {
    dimensions: { width: 1080, height: 1080 },
    aspectRatio: '1/1',
    quality: 85,
    priority: true,
  },
  spotify: {
    dimensions: { width: 640, height: 640 },
    aspectRatio: '1/1',
    quality: 85,
    priority: false,
  },
  twitch: {
    dimensions: { width: 1200, height: 600 },
    aspectRatio: '2/1',
    quality: 85,
    priority: false,
  },
  linkedin: {
    dimensions: { width: 1584, height: 396 },
    aspectRatio: '4/1',
    quality: 85,
    priority: false,
  },
}

// Image optimization preload hints
export function generateImagePreloadLinks(platform: string): string[] {
  const config = PLATFORM_IMAGE_CONFIGS[platform.toLowerCase() as keyof typeof PLATFORM_IMAGE_CONFIGS]
  if (!config) return []

  return [
    `<link rel="preload" as="image" type="image/webp" href="/platform-examples/${platform.toLowerCase()}/original-1.webp" />`,
    `<link rel="preload" as="image" type="image/webp" href="/platform-examples/${platform.toLowerCase()}/original-2.webp" />`,
  ]
}