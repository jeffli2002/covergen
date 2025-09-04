import { Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList, Product, WithContext, Question } from 'schema-dts'

// Base organization schema
export const organizationSchema: WithContext<Organization> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://covergen.pro/#organization',
  name: 'CoverGen AI',
  alternateName: 'Cover Generator AI',
  url: 'https://covergen.pro',
  logo: {
    '@type': 'ImageObject',
    url: 'https://covergen.pro/logo.png',
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
    email: 'support@covergen.pro',
    availableLanguage: ['en', 'es', 'pt', 'zh', 'ar'],
  },
}

// Website schema with search action
export const websiteSchema: WithContext<WebSite> = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://covergen.pro/#website',
  url: 'https://covergen.pro',
  name: 'CoverGen AI',
  description: 'Create stunning covers and thumbnails with AI for YouTube, TikTok, Spotify, and more. Nano banana powered technology.',
  publisher: {
    '@id': 'https://covergen.pro/#organization',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://covergen.pro/search?q={search_term_string}',
    query: 'required name=search_term_string',
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
      price: '9',
      priceCurrency: 'USD',
      name: 'Pro Plan',
      description: 'Unlimited covers, priority generation',
      priceValidUntil: '2026-12-31',
    },
    {
      '@type': 'Offer',
      price: '19',
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
    'https://covergen.pro/screenshots/dashboard.png',
    'https://covergen.pro/screenshots/editor.png',
    'https://covergen.pro/screenshots/gallery.png',
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
    highPrice: '19',
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

// Tool schema generator
export function generateToolSchema(tool: {
  name: string
  description: string
  features: string[]
  url: string
}): WithContext<SoftwareApplication> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `CoverGen AI - ${tool.name}`,
    operatingSystem: 'Web',
    applicationCategory: 'DesignApplication',
    applicationSubCategory: 'AI Design Tool',
    description: tool.description,
    url: tool.url,
    featureList: tool.features,
    provider: {
      '@id': 'https://covergen.pro/#organization',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '3247',
      bestRating: '5',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
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
      '@id': 'https://covergen.pro/#organization',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2543',
    },
  }
}

// Article schema generator for blog posts
export function generateArticleSchema(article: {
  title: string
  description: string
  author: string
  datePublished: string
  dateModified?: string
  imageUrl: string
  url: string
  wordCount: number
  keywords: string[]
}): WithContext<any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
      url: `https://covergen.pro/authors/${article.author.toLowerCase().replace(' ', '-')}`,
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.imageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    publisher: {
      '@id': 'https://covergen.pro/#organization',
    },
    wordCount: article.wordCount,
    keywords: article.keywords.join(', '),
    articleSection: 'Content Creation',
  }
}

// How-to schema generator for tutorials
export function generateHowToSchema(tutorial: {
  name: string
  description: string
  totalTime: string
  steps: Array<{ name: string; text: string; image?: string }>
  imageUrl: string
}): WithContext<any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: tutorial.name,
    description: tutorial.description,
    totalTime: tutorial.totalTime,
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'CoverGen Pro Account (Free or Paid)',
      },
      {
        '@type': 'HowToSupply',
        name: 'Reference Image (Optional)',
      },
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Web Browser',
      },
      {
        '@type': 'HowToTool',
        name: 'Internet Connection',
      },
    ],
    step: tutorial.steps.map((step, index) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
      image: step.image,
      position: index + 1,
    })),
    image: tutorial.imageUrl,
  }
}

// Video schema generator for video content
export function generateVideoSchema(video: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration: string
  embedUrl: string
  transcript?: string
}): WithContext<any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    embedUrl: video.embedUrl,
    transcript: video.transcript,
    publisher: {
      '@id': 'https://covergen.pro/#organization',
    },
    contentUrl: video.embedUrl,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: '12456',
    },
  }
}

// Local Business schema for contact/support pages
export function generateLocalBusinessSchema(): WithContext<any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://covergen.pro/#localbusiness',
    name: 'CoverGen Pro Support',
    image: 'https://covergen.pro/logo.png',
    url: 'https://covergen.pro',
    telephone: '+1-555-123-4567',
    email: 'support@covergen.pro',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 AI Street',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94105',
      addressCountry: 'US',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    priceRange: '$0 - $20',
  }
}