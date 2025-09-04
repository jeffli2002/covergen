// Enhanced metadata generation for platform and tool pages with improved SEO

import { Metadata } from 'next'
import { getHighOpportunityKeywords } from '@/lib/seo/keyword-merger'
import { getPlatformKeywords } from '@/lib/seo/platform-keywords'

interface PlatformMetadataConfig {
  platform: string
  locale: string
  title: string
  description: string
  additionalKeywords?: string[]
  ogImage?: string
  twitterImage?: string
  customSchema?: any
}

interface ToolMetadataConfig {
  tool: string
  locale: string
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  features?: string[]
  price?: string
  rating?: {
    value: string
    count: string
  }
}

// Generate enhanced metadata for platform pages
export function generatePlatformMetadata({
  platform,
  locale,
  title,
  description,
  additionalKeywords = [],
  ogImage,
  twitterImage
}: PlatformMetadataConfig): Metadata {
  // Get platform-specific keywords
  const platformKeywords = getPlatformKeywords(platform)
  
  // Get high-opportunity keywords relevant to the platform
  const highOpKeywords = getHighOpportunityKeywords()
    .filter(k => k.keyword.toLowerCase().includes(platform.toLowerCase()))
    .slice(0, 15)
    .map(k => k.keyword)
  
  // Combine all keywords intelligently
  const allKeywords = [
    ...new Set([
      ...platformKeywords.slice(0, 20),
      ...highOpKeywords,
      ...additionalKeywords,
      // Add common conversion keywords
      `free ${platform} cover maker`,
      `${platform} thumbnail generator`,
      `${platform} cover design`,
      `best ${platform} cover maker`,
      `${platform} cover maker online`,
      `${platform} cover maker no watermark`,
      `ai ${platform} cover generator`,
      `professional ${platform} covers`
    ])
  ].slice(0, 50) // Limit to 50 keywords
  
  // Generate structured title with modifiers
  const enhancedTitle = `${title} | Free AI Generator | No Watermark | CoverGen Pro`
  
  // Optimize description for search snippets
  const enhancedDescription = `${description} ✓ 100% Free ✓ No Watermark ✓ AI-Powered ✓ Perfect Dimensions ✓ Instant Download. Join 100K+ creators using CoverGen Pro.`
  
  return {
    title: enhancedTitle,
    description: enhancedDescription.slice(0, 160),
    keywords: allKeywords.join(', '),
    authors: [{ name: 'CoverGen Pro' }],
    creator: 'CoverGen Pro',
    publisher: 'CoverGen Pro',
    category: 'Design Tools',
    applicationName: 'CoverGen Pro',
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false
    },
    openGraph: {
      title: enhancedTitle,
      description: enhancedDescription,
      url: `https://covergen.pro/${locale}/platforms/${platform}`,
      siteName: 'CoverGen Pro',
      images: [
        {
          url: ogImage || `https://covergen.pro/platform-examples/${platform}-showcase.jpg`,
          width: 1200,
          height: 630,
          alt: `${platform} Cover Maker - AI Generated Examples`,
          type: 'image/jpeg'
        }
      ],
      locale: locale === 'zh' ? 'zh_CN' : locale,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: enhancedTitle,
      description: enhancedDescription,
      creator: '@covergenai',
      site: '@covergenai',
      images: [twitterImage || ogImage || `https://covergen.pro/platform-examples/${platform}-showcase.jpg`]
    },
    alternates: {
      canonical: `https://covergen.pro/${locale}/platforms/${platform}`,
      languages: {
        'en': `/en/platforms/${platform}`,
        'es': `/es/platforms/${platform}`,
        'zh': `/zh/platforms/${platform}`,
        'ja': `/ja/platforms/${platform}`,
        'ko': `/ko/platforms/${platform}`,
        'fr': `/fr/platforms/${platform}`,
        'de': `/de/platforms/${platform}`,
        'pt': `/pt/platforms/${platform}`,
        'ar': `/ar/platforms/${platform}`,
        'hi': `/hi/platforms/${platform}`
      }
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    verification: {
      google: 'google-site-verification-code',
      yandex: 'yandex-verification-code',
      yahoo: 'yahoo-verification-code'
    },
    other: {
      'msapplication-TileColor': '#2563eb',
      'msapplication-config': '/browserconfig.xml',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'CoverGen Pro',
      'mobile-web-app-capable': 'yes',
      'og:image:width': '1200',
      'og:image:height': '630',
      'article:author': 'CoverGen Pro Team',
      'article:published_time': new Date().toISOString(),
      'article:modified_time': new Date().toISOString()
    }
  }
}

// Generate enhanced metadata for tool pages
export function generateToolMetadata({
  tool,
  locale,
  title,
  description,
  keywords,
  ogImage,
  features = [],
  price = 'Free',
  rating
}: ToolMetadataConfig): Metadata {
  // Add tool-specific power keywords
  const enhancedKeywords = [
    ...keywords,
    `${tool} online`,
    `free ${tool}`,
    `best ${tool}`,
    `${tool} no watermark`,
    `${tool} app`,
    `${tool} software`,
    `professional ${tool}`,
    `${tool} for beginners`,
    `${tool} tutorial`,
    `how to use ${tool}`
  ]
  
  // Rich snippet optimization
  const enhancedTitle = `${title} - ${price} Online Tool | CoverGen Pro`
  const enhancedDescription = `${description} ${features.length > 0 ? `Features: ${features.slice(0, 3).join(', ')}.` : ''} ⭐ ${rating?.value || '4.8'}/5 (${rating?.count || '10K+'} reviews)`
  
  return {
    ...generatePlatformMetadata({
      platform: tool.replace(/-/g, ' '),
      locale,
      title: enhancedTitle,
      description: enhancedDescription,
      additionalKeywords: enhancedKeywords,
      ogImage
    }),
    alternates: {
      canonical: `https://covergen.pro/${locale}/tools/${tool}`,
      languages: {
        'en': `/en/tools/${tool}`,
        'es': `/es/tools/${tool}`,
        'zh': `/zh/tools/${tool}`,
        'ja': `/ja/tools/${tool}`,
        'ko': `/ko/tools/${tool}`,
        'fr': `/fr/tools/${tool}`,
        'de': `/de/tools/${tool}`,
        'pt': `/pt/tools/${tool}`,
        'ar': `/ar/tools/${tool}`,
        'hi': `/hi/tools/${tool}`
      }
    }
  }
}

// Generate JSON-LD schema for rich snippets
export function generateEnhancedSchema(type: 'platform' | 'tool', data: any) {
  const baseOrganization = {
    '@type': 'Organization',
    name: 'CoverGen Pro',
    url: 'https://covergen.pro',
    logo: 'https://covergen.pro/logo.png',
    sameAs: [
      'https://twitter.com/covergenai',
      'https://www.facebook.com/covergenai',
      'https://www.instagram.com/covergenai',
      'https://www.youtube.com/@covergenai'
    ]
  }
  
  if (type === 'platform') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `https://covergen.pro/${data.locale}/platforms/${data.platform}`,
          url: `https://covergen.pro/${data.locale}/platforms/${data.platform}`,
          name: data.title,
          description: data.description,
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://covergen.pro'
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Platforms',
                item: 'https://covergen.pro/platforms'
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: data.platform,
                item: `https://covergen.pro/${data.locale}/platforms/${data.platform}`
              }
            ]
          },
          isPartOf: {
            '@type': 'WebSite',
            '@id': 'https://covergen.pro',
            name: 'CoverGen Pro',
            description: 'AI-Powered Cover & Thumbnail Generator',
            publisher: baseOrganization
          }
        },
        {
          '@type': 'SoftwareApplication',
          name: `${data.platform} Cover Maker`,
          description: data.description,
          applicationCategory: 'DesignApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: data.rating?.value || '4.8',
            ratingCount: data.rating?.count || '10000',
            bestRating: '5',
            worstRating: '1'
          },
          featureList: data.features || []
        }
      ]
    }
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: data.title,
    description: data.description,
    url: `https://covergen.pro/${data.locale}/tools/${data.tool}`,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    provider: baseOrganization,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: data.rating?.value || '4.8',
      ratingCount: data.rating?.count || '10000',
      bestRating: '5',
      worstRating: '1'
    }
  }
}