import { Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList, Product, WithContext, Question } from 'schema-dts'

// Base organization schema
export const organizationSchema: WithContext<Organization> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://covergen.ai/#organization',
  name: 'CoverGen AI',
  alternateName: 'Cover Generator AI',
  url: 'https://covergen.ai',
  logo: {
    '@type': 'ImageObject',
    url: 'https://covergen.ai/logo.png',
    width: '600',
    height: '600',
  },
  description: 'AI-powered cover and thumbnail generator for content creators across YouTube, TikTok, Spotify, and more platforms.',
  sameAs: [
    'https://twitter.com/covergenai',
    'https://www.linkedin.com/company/covergenai',
    'https://github.com/covergenai',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-555-123-4567',
    contactType: 'customer support',
    email: 'support@covergen.ai',
    availableLanguage: ['en', 'es', 'pt', 'zh', 'ar'],
  },
}

// Website schema with search action
export const websiteSchema: WithContext<WebSite> = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://covergen.ai/#website',
  url: 'https://covergen.ai',
  name: 'CoverGen AI',
  description: 'Create stunning covers and thumbnails with AI for YouTube, TikTok, Spotify, and more. Nano banana powered technology.',
  publisher: {
    '@id': 'https://covergen.ai/#organization',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://covergen.ai/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
  inLanguage: ['en', 'es', 'pt', 'zh', 'ar'],
}

// Software application schema
export const softwareApplicationSchema: WithContext<SoftwareApplication> = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CoverGen AI',
  operatingSystem: 'Web',
  applicationCategory: 'DesignApplication',
  applicationSubCategory: 'AI Design Tool',
  description: 'AI-powered cover and thumbnail generator with nano banana technology for content creators.',
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      name: 'Free Plan',
      description: '3 free covers daily',
    },
    {
      '@type': 'Offer',
      price: '9.99',
      priceCurrency: 'USD',
      name: 'Pro Plan',
      description: 'Unlimited covers, priority generation',
      priceValidUntil: '2026-12-31',
    },
    {
      '@type': 'Offer',
      price: '19.99',
      priceCurrency: 'USD',
      name: 'Pro+ Plan',
      description: 'Everything in Pro + API access, team features',
      priceValidUntil: '2026-12-31',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '2543',
    bestRating: '5',
  },
  screenshot: [
    'https://covergen.ai/screenshots/dashboard.png',
    'https://covergen.ai/screenshots/editor.png',
    'https://covergen.ai/screenshots/gallery.png',
  ],
  featureList: [
    'AI-powered cover generation',
    'Multi-platform support (YouTube, TikTok, Spotify, etc.)',
    'Nano banana enhanced algorithms',
    'Instant generation in under 10 seconds',
    'Local image editing with masks',
    'Commercial usage rights',
    'API access for developers',
    'Team collaboration features',
  ],
}

// Product schema for pricing pages
export const productSchema: WithContext<Product> = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'CoverGen AI Pro Subscription',
  description: 'Professional AI cover generation with nano banana technology for content creators',
  brand: {
    '@type': 'Brand',
    name: 'CoverGen AI',
  },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '0',
    highPrice: '19.99',
    offerCount: '3',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '2543',
  },
  review: [
    {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
      },
      author: {
        '@type': 'Person',
        name: 'Sarah Chen',
      },
      reviewBody: 'CoverGen AI transformed my YouTube channel. My CTR increased by 45% after using their thumbnails!',
    },
    {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
      },
      author: {
        '@type': 'Person',
        name: 'Mike Rodriguez',
      },
      reviewBody: 'The nano banana technology really makes a difference. Best cover generator I\'ve used!',
    },
  ],
}

// Breadcrumb generator
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// FAQ schema generator
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq): Question => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Platform-specific schema generator
export function generatePlatformSchema(platform: string, features: string[]): WithContext<SoftwareApplication> {
  const platformNames: Record<string, string> = {
    youtube: 'YouTube Thumbnail Maker',
    tiktok: 'TikTok Cover Creator',
    spotify: 'Spotify Cover Art Generator',
    twitch: 'Twitch Thumbnail Designer',
    instagram: 'Instagram Post Designer',
    linkedin: 'LinkedIn Cover Creator',
    xiaohongshu: 'Xiaohongshu Cover Maker',
    wechat: 'WeChat Moments Cover Designer',
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `CoverGen AI - ${platformNames[platform] || platform}`,
    operatingSystem: 'Web',
    applicationCategory: 'DesignApplication',
    description: `AI-powered ${platform} cover generator with nano banana technology. Create stunning covers optimized for ${platform}'s algorithm.`,
    featureList: features,
    provider: {
      '@id': 'https://covergen.ai/#organization',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2543',
    },
  }
}