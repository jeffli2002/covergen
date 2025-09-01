import { Metadata } from 'next'
import { organizationSchema, websiteSchema, softwareApplicationSchema } from './schema'

interface GenerateMetadataParams {
  title: string
  description: string
  keywords?: string[]
  path: string
  locale?: string
  images?: Array<{
    url: string
    width?: number
    height?: number
    alt?: string
  }>
  noindex?: boolean
  schema?: any
}

const DEFAULT_KEYWORDS = [
  'AI cover generator',
  'thumbnail maker', 
  'cover creator',
  'AI design tool',
  'nano banana',
  'Google Gemini 2.5 Flash',
  'independent platform',
  'content creator tools',
  'social media covers',
  'instant generation',
]

export function generateMetadata({
  title,
  description,
  keywords = [],
  path,
  locale = 'en',
  images = [],
  noindex = false,
  schema,
}: GenerateMetadataParams): Metadata {
  const baseUrl = 'https://covergen.pro'
  const url = `${baseUrl}${locale !== 'en' ? `/${locale}` : ''}${path}`
  
  const defaultImage = {
    url: 'https://covergen.pro/og-image.png',
    width: 1200,
    height: 630,
    alt: 'CoverGen AI - AI-Powered Cover Generator',
  }

  const metaImages = images.length > 0 ? images : [defaultImage]

  return {
    title,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    authors: [{ name: 'CoverGen AI Team' }],
    creator: 'CoverGen AI',
    publisher: 'CoverGen AI',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
      languages: {
        'en': `${baseUrl}${path}`,
        'es': `${baseUrl}/es${path}`,
        'pt-BR': `${baseUrl}/pt${path}`,
        'zh-CN': `${baseUrl}/zh${path}`,
        'ar': `${baseUrl}/ar${path}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'pt' ? 'pt_BR' : locale,
      url,
      title,
      description,
      siteName: 'CoverGen AI',
      images: metaImages,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@covergenai',
      creator: '@covergenai',
      title,
      description,
      images: metaImages.map(img => img.url),
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      nocache: noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        noimageindex: noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'CoverGen AI',
      'application-name': 'CoverGen AI',
      'msapplication-TileColor': '#2563eb',
      'msapplication-config': '/browserconfig.xml',
      'theme-color': '#ffffff',
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  }
}

// Platform-specific metadata generators
export function generatePlatformMetadata(platform: string, locale: string = 'en'): Metadata {
  const platformData: Record<string, { title: string; description: string; keywords: string[] }> = {
    youtube: {
      title: 'YouTube Thumbnail Maker - AI-Powered Thumbnail Generator | CoverGen AI',
      description: 'Create eye-catching YouTube thumbnails in seconds with AI and nano banana technology. Boost your CTR by 40% with professional thumbnails optimized for YouTube\'s algorithm.',
      keywords: ['YouTube thumbnail maker', 'YouTube thumbnail generator', 'YouTube cover maker', 'clickbait thumbnail', 'YouTube thumbnail size', 'YouTube thumbnail ideas'],
    },
    tiktok: {
      title: 'TikTok Cover Creator - AI Cover Generator for TikTok | CoverGen AI',
      description: 'Design viral TikTok covers with AI-powered generation using nano banana technology. Perfect dimensions and styles for maximum engagement on TikTok.',
      keywords: ['TikTok cover maker', 'TikTok thumbnail creator', 'TikTok cover design', 'viral TikTok covers', 'TikTok cover size'],
    },
    spotify: {
      title: 'Spotify Cover Art Generator - AI Music Cover Designer | CoverGen AI',
      description: 'Create professional Spotify cover art with AI and nano banana algorithms. Perfect 3000x3000 album covers that meet Spotify\'s guidelines.',
      keywords: ['Spotify cover art', 'album cover maker', 'music cover generator', 'Spotify playlist cover', 'album art creator'],
    },
    twitch: {
      title: 'Twitch Thumbnail Designer - Stream Cover Generator | CoverGen AI',
      description: 'Generate professional Twitch thumbnails and stream covers with AI nano banana technology. Optimized for Twitch\'s platform requirements.',
      keywords: ['Twitch thumbnail maker', 'stream thumbnail generator', 'Twitch cover creator', 'gaming thumbnail maker'],
    },
    instagram: {
      title: 'Instagram Post Designer - AI Cover Maker for Instagram | CoverGen AI',
      description: 'Create stunning Instagram posts and story covers with AI-powered nano banana generation. Perfect square and story dimensions.',
      keywords: ['Instagram post maker', 'Instagram cover creator', 'Instagram story designer', 'Instagram thumbnail generator'],
    },
    linkedin: {
      title: 'LinkedIn Cover Creator - Professional Cover Generator | CoverGen AI',
      description: 'Design professional LinkedIn cover images with AI and nano banana technology. Perfect for personal branding and company pages.',
      keywords: ['LinkedIn cover maker', 'LinkedIn banner creator', 'professional cover generator', 'LinkedIn header designer'],
    },
    xiaohongshu: {
      title: 'Xiaohongshu Cover Maker - RED Note Cover Generator | CoverGen AI',
      description: 'Create engaging Xiaohongshu (Little Red Book) covers with AI nano banana generation. Optimized for Chinese social media engagement.',
      keywords: ['Xiaohongshu cover maker', 'RED note cover', 'Little Red Book cover', 'Chinese social media cover'],
    },
    wechat: {
      title: 'WeChat Moments Cover Designer - AI Cover Generator | CoverGen AI',
      description: 'Design beautiful WeChat Moments covers with AI-powered nano banana technology. Perfect for WeChat articles and moments.',
      keywords: ['WeChat cover maker', 'WeChat moments cover', 'WeChat article cover', 'Chinese social media design'],
    },
  }

  const data = platformData[platform] || {
    title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Cover Generator | CoverGen AI`,
    description: `Create stunning covers for ${platform} with AI-powered generation and nano banana technology.`,
    keywords: [`${platform} cover maker`, `${platform} thumbnail generator`],
  }

  return generateMetadata({
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    path: `/platforms/${platform}`,
    locale,
    images: [{
      url: `https://covergen.pro/${platform}-cover-generator-og.jpg`,
      width: 1200,
      height: 630,
      alt: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Cover Generator - CoverGen AI`,
    }],
  })
}

// Blog post metadata generator
export function generateBlogMetadata(
  slug: string,
  title: string,
  description: string,
  author: string,
  publishDate: string,
  tags: string[] = [],
  locale: string = 'en'
): Metadata {
  return {
    ...generateMetadata({
      title: `${title} | CoverGen AI Blog`,
      description,
      keywords: [...tags, 'AI design blog', 'cover design tips', 'thumbnail creation guide'],
      path: `/blog/${slug}`,
      locale,
      images: [{
        url: `https://covergen.pro/blog/${slug}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: title,
      }],
    }),
    openGraph: {
      type: 'article',
      authors: [author],
      publishedTime: publishDate,
      tags,
    },
    other: {
      'article:author': author,
      'article:published_time': publishDate,
      'article:tag': tags.join(','),
    },
  }
}