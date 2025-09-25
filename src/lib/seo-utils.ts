// SEO utility functions and constants
import { PLATFORM_KEYWORDS, getPlatformKeywords, getAllKeywords } from './seo/platform-keywords';

// Re-export for external use
export { getPlatformKeywords };

export const SEO_CONSTANTS = {
  siteName: 'CoverGen AI',
  siteUrl: 'https://covergen.pro',
  twitterHandle: '@covergenai',
  defaultOgImage: '/og-image.jpg',
  
  // Title templates
  titleTemplate: '%s | CoverGen AI',
  homepageTitle: 'CoverGen AI - AI-Powered Cover & Poster Generator for Content Creators',
  
  // Common keywords by category - now using the comprehensive platform keywords
  keywords: {
    general: [
      'AI cover generator',
      'social media cover design',
      'content creator tools',
      'automatic cover generation',
      'AI design tools',
      'cover',
      'cover image',
      'cover maker',
      'cover image generator',
      'thumbnail',
      'thumbnail maker',
      'poster',
      'poster maker',
      'poster image maker',
      'poster image generator',
    ],
    youtube: getPlatformKeywords('youtube'),
    tiktok: getPlatformKeywords('tiktok'),
    spotify: getPlatformKeywords('spotify'),
    twitch: getPlatformKeywords('twitch'),
    instagram: getPlatformKeywords('instagram'),
    linkedin: getPlatformKeywords('linkedin'),
    twitter: getPlatformKeywords('twitter'),
    facebook: getPlatformKeywords('facebook'),
    pinterest: getPlatformKeywords('pinterest'),
    snapchat: getPlatformKeywords('snapchat'),
    discord: getPlatformKeywords('discord'),
    reddit: getPlatformKeywords('reddit'),
    telegram: getPlatformKeywords('telegram'),
    whatsapp: getPlatformKeywords('whatsapp'),
    xiaohongshu: getPlatformKeywords('xiaohongshu'),
    wechat: getPlatformKeywords('wechat'),
    weibo: getPlatformKeywords('weibo'),
    bilibili: getPlatformKeywords('bilibili'),
    douyin: getPlatformKeywords('douyin'),
    amazon: getPlatformKeywords('amazon'),
    etsy: getPlatformKeywords('etsy'),
    shopify: getPlatformKeywords('shopify'),
    behance: getPlatformKeywords('behance'),
    dribbble: getPlatformKeywords('dribbble'),
    figma: getPlatformKeywords('figma'),
  }
}

// Generate platform-specific meta description
export function generatePlatformDescription(platform: string): string {
  const descriptions: Record<string, string> = {
    youtube: 'Create eye-catching YouTube thumbnails in seconds with AI. Boost your CTR by 40% with professional thumbnails optimized for YouTube\'s algorithm.',
    tiktok: 'Design viral TikTok covers that boost engagement. AI-powered vertical cover generation optimized for TikTok\'s algorithm and Gen-Z aesthetics.',
    spotify: 'Generate professional Spotify album covers and playlist artwork. AI-powered square format designs that look great at any size.',
    twitch: 'Create engaging Twitch thumbnails and stream overlays. AI-powered designs optimized for gaming content and streaming culture.',
    bilibili: 'Design stunning Bilibili video covers with AI. Optimized for Chinese video platform with anime and gaming aesthetics.',
    rednote: 'Create aesthetic Rednote covers that drive engagement. AI-powered designs for lifestyle and beauty content.',
    wechat: 'Generate professional WeChat Channels covers. AI-powered vertical format optimized for Chinese social media.'
  }
  
  return descriptions[platform] || SEO_CONSTANTS.homepageTitle
}

// Generate structured data for different page types
export function generateStructuredData(type: string, data: any) {
  switch (type) {
    case 'article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        author: {
          '@type': 'Person',
          name: data.author || 'CoverGen AI Team'
        },
        datePublished: data.publishDate,
        dateModified: data.modifiedDate || data.publishDate,
        publisher: {
          '@type': 'Organization',
          name: 'CoverGen AI',
          logo: {
            '@type': 'ImageObject',
            url: `${SEO_CONSTANTS.siteUrl}/blueLogoTransparent.png`
          }
        }
      }
      
    case 'faq':
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.questions.map((q: any) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer
          }
        }))
      }
      
    case 'howto':
      return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: data.title,
        description: data.description,
        step: data.steps.map((step: any, index: number) => ({
          '@type': 'HowToStep',
          name: step.name,
          text: step.text,
          position: index + 1
        }))
      }
      
    default:
      return null
  }
}

// Generate breadcrumb structured data
export function generateBreadcrumbSchema(items: Array<{name: string, url: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

// Clean and optimize meta descriptions
export function optimizeMetaDescription(description: string): string {
  // Remove extra spaces
  let optimized = description.replace(/\s+/g, ' ').trim()
  
  // Ensure it's within optimal length (155-160 characters)
  if (optimized.length > 160) {
    optimized = optimized.substring(0, 157) + '...'
  }
  
  return optimized
}

// Generate alt text for AI-generated images
export function generateImageAltText(platform: string, title: string): string {
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1)
  return `AI-generated ${platformName} cover image for "${title}"`
}

// Format URL for SEO-friendly slugs
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Check if a page should be indexed
export function shouldIndexPage(pathname: string): boolean {
  const noindexPatterns = [
    /^\/dashboard/,
    /^\/editor/,
    /^\/account/,
    /^\/settings/,
    /^\/api/,
    /^\/auth/,
    /^\/admin/
  ]
  
  return !noindexPatterns.some(pattern => pattern.test(pathname))
}