import { Metadata } from 'next'
import { organizationSchema, websiteSchema, softwareApplicationSchema } from './schema'
import { getAllKeywords, getPlatformKeywords } from './platform-keywords'
import { generateAlternateUrls, shouldNoIndex } from './canonical'
import { type Locale } from '@/lib/i18n/config'

interface GenerateMetadataParams {
  title: string
  description: string
  keywords?: string[]
  path: string
  locale?: Locale
  images?: Array<{
    url: string
    width?: number
    height?: number
    alt?: string
  }>
  noindex?: boolean
  schema?: any
  searchParams?: Record<string, string | string[] | undefined>
  useDefaultKeywords?: boolean
}

const DEFAULT_KEYWORDS = getAllKeywords()

export function generateMetadata({
  title,
  description,
  keywords = [],
  path,
  locale = 'en',
  images = [],
  noindex = false,
  schema,
  searchParams,
  useDefaultKeywords = true,
}: GenerateMetadataParams): Metadata {
  const baseUrl = 'https://covergen.pro'
  
  // Generate canonical and alternate URLs using centralized function
  const { canonical, languages } = generateAlternateUrls(path, locale, searchParams)
  
  // Check if page should be noindex based on path
  const shouldBeNoIndex = noindex || shouldNoIndex(path)
  
  const defaultImage = {
    url: 'https://covergen.pro/og-image.png',
    width: 1200,
    height: 630,
    alt: 'CoverGen Pro - AI-Powered Cover Generator',
  }

  const metaImages = images.length > 0 ? images : [defaultImage]

  return {
    title,
    description,
    keywords: useDefaultKeywords ? [...DEFAULT_KEYWORDS, ...keywords] : keywords,
    authors: [{ name: 'CoverGen Pro Team' }],
    creator: 'CoverGen Pro',
    publisher: 'CoverGen Pro',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: 'website',
      locale: (locale as string) === 'zh' ? 'zh_CN' : (locale as string) === 'pt' ? 'pt_BR' : locale,
      url: canonical,
      title,
      description,
      siteName: 'CoverGen Pro',
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
      index: !shouldBeNoIndex,
      follow: !shouldBeNoIndex,
      nocache: shouldBeNoIndex,
      googleBot: {
        index: !shouldBeNoIndex,
        follow: !shouldBeNoIndex,
        noimageindex: shouldBeNoIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'CoverGen Pro',
      'application-name': 'CoverGen Pro',
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
export function generatePlatformMetadata(
  platform: string, 
  locale: Locale = 'en',
  searchParams?: Record<string, string | string[] | undefined>
): Metadata {
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
    rednote: {
      title: 'RedNote Cover Maker - Little Red Book Cover Generator | CoverGen AI',
      description: 'Create engaging RedNote (Xiaohongshu) covers with AI nano banana generation. Optimized for Chinese social media engagement.',
      keywords: ['RedNote cover maker', 'Xiaohongshu cover', 'Little Red Book cover', 'Chinese social media cover'],
    },
    wechat: {
      title: 'WeChat Moments Cover Designer - AI Cover Generator | CoverGen AI',
      description: 'Design beautiful WeChat Moments covers with AI-powered nano banana technology. Perfect for WeChat articles and moments.',
      keywords: ['WeChat cover maker', 'WeChat moments cover', 'WeChat article cover', 'Chinese social media design'],
    },
    bilibili: {
      title: 'Bilibili Cover Maker - AI Video Cover Generator | CoverGen AI',
      description: 'Create eye-catching Bilibili video covers with AI-powered generation. Optimized for Bilibili\'s platform requirements and audience.',
      keywords: ['Bilibili cover maker', 'Bilibili thumbnail generator', 'Bilibili video cover', 'Chinese video platform cover'],
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
    searchParams,
    images: [{
      url: `https://covergen.pro/${platform}-cover-generator-og.jpg`,
      width: 1200,
      height: 630,
      alt: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Cover Generator - CoverGen AI`,
    }],
  })
}

// Tool-specific metadata generator
export function generateToolMetadata(
  tool: string,
  locale: Locale = 'en',
  searchParams?: Record<string, string | string[] | undefined>
): Metadata {
  const toolData: Record<string, { title: string; description: string; keywords: string[] }> = {
    'spotify-playlist-cover': {
      title: 'Spotify Playlist Cover Maker - Create AI Covers | CoverGen Pro',
      description: 'Design professional Spotify playlist covers with AI. Create eye-catching 300x300 pixel artwork that makes your playlists stand out. Free, instant generation.',
      keywords: ['spotify playlist cover', 'playlist cover maker', 'spotify cover generator', 'playlist artwork', 'music cover design', 'spotify canvas maker', 'spotify playlist cover maker', 'mixtape cover generator', 'album art generator', 'spotify cover art'],
    },
    'facebook-event-cover': {
      title: 'Facebook Event Cover Maker - AI Event Banner Generator | CoverGen Pro',
      description: 'Create stunning Facebook event covers with AI. Perfect 1920x1080 dimensions for maximum engagement. Free event banner maker.',
      keywords: ['facebook event cover', 'event banner maker', 'facebook cover photo', 'event cover generator', 'social media event banner', 'fall facebook covers', 'facebook cover maker app', 'how to make facebook post shareable', 'facebook cover dimensions', 'facebook banner maker'],
    },
    'anime-poster-maker': {
      title: 'Anime Poster Maker - AI Anime Cover Generator | CoverGen Pro',
      description: 'Create stunning anime-style posters and covers with AI. Perfect for manga covers, anime thumbnails, and Japanese-style artwork.',
      keywords: ['anime poster maker', 'anime cover generator', 'manga cover maker', 'anime thumbnail creator', 'anime art generator', 'ai anime generator', 'anime poster design', 'manga cover creator', 'anime wallpaper maker', 'japanese poster maker'],
    },
    'book-cover-creator': {
      title: 'Book Cover Creator - AI Book Cover Design | CoverGen Pro',
      description: 'Design professional book covers with AI. Perfect for self-publishers, authors, and indie writers. All genres supported.',
      keywords: ['book cover creator', 'book cover maker', 'ebook cover design', 'novel cover generator', 'self publishing cover', 'blank book cover', 'fantasy book covers', 'book sleeve', 'ai book cover generator', 'kindle cover creator', 'wattpad cover maker', 'book cover generator free', 'kindle book cover maker'],
    },
    'game-cover-art': {
      title: 'Game Cover Art Generator - AI Gaming Artwork | CoverGen Pro',
      description: 'Create epic game cover art with AI. Perfect for Steam, Epic Games, indie games, and gaming thumbnails.',
      keywords: ['game cover art', 'gaming cover maker', 'steam cover generator', 'game thumbnail creator', 'gaming artwork', 'fortnite thumbnail', 'minecraft thumbnail', 'gaming thumbnail maker', 'fortnite thumbnails', 'game poster maker', 'video game cover art', 'roblox thumbnail maker ai'],
    },
    'music-album-cover': {
      title: 'Music Album Cover Maker - AI Album Art Generator | CoverGen Pro',
      description: 'Design professional album covers with AI. Perfect for musicians, bands, and music producers. All music genres supported.',
      keywords: ['album cover maker', 'music cover generator', 'album art creator', 'music artwork design', 'band cover maker', 'album art generator', 'ai album art generator', 'cd cover dimensions', 'cd jewel case template', 'compact disk cover size', 'best album covers of all time', 'iconic album covers', 'tyler the creator album cover', 'free album cover generator'],
    },
    'social-media-poster': {
      title: 'Social Media Poster Maker - AI Post Generator | CoverGen Pro',
      description: 'Create eye-catching social media posts with AI. Perfect for Instagram, Facebook, Twitter, and all social platforms.',
      keywords: ['social media poster', 'post maker', 'social media graphics', 'content creator tool', 'social media design'],
    },
    'webinar-poster-maker': {
      title: 'Webinar Poster Maker - AI Webinar Graphics | CoverGen Pro',
      description: 'Design professional webinar posters and banners with AI. Perfect for online events, workshops, and virtual conferences.',
      keywords: ['webinar poster', 'webinar banner maker', 'online event cover', 'virtual event graphics', 'webinar design'],
    },
    'event-poster-designer': {
      title: 'Event Poster Designer - AI Event Graphics | CoverGen Pro',
      description: 'Create stunning event posters with AI. Perfect for concerts, festivals, conferences, and all types of events.',
      keywords: ['event poster designer', 'event flyer maker', 'concert poster generator', 'festival banner creator', 'event graphics', 'halloween poster creator', 'birthday poster maker', 'wedding invitation cover', 'poster maker free online'],
    },
    'instagram-thumbnail-maker': {
      title: 'Instagram Thumbnail Maker - Create Stunning IG Covers | CoverGen Pro',
      description: 'Design eye-catching Instagram thumbnails and post covers with AI. Perfect square format for Instagram posts, reels, and IGTV.',
      keywords: ['instagram thumbnail maker', 'instagram cover creator', 'instagram post maker', 'instagram story designer', 'instagram thumbnail generator', 'ig thumbnail maker', 'instagram grid maker', 'instagram highlight cover maker'],
    },
    'linkedin-banner-maker': {
      title: 'LinkedIn Banner Maker - Professional Cover Creator | CoverGen Pro',
      description: 'Create professional LinkedIn banner images with AI. Perfect dimensions for personal profiles and company pages.',
      keywords: ['linkedin banner maker', 'linkedin cover creator', 'professional cover generator', 'linkedin header designer', 'linkedin background image', 'professional banner maker', 'career banner design'],
    },
    'wattpad-cover-maker': {
      title: 'Wattpad Cover Maker - AI Story Cover Generator | CoverGen Pro',
      description: 'Create stunning covers for your Wattpad stories with AI. Perfect dimensions, genre-specific designs, and instant generation for all your novels.',
      keywords: ['wattpad cover maker', 'wattpad cover creator', 'story cover generator', 'novel cover maker', 'wattpad book cover', 'fanfiction cover design', 'wattpad cover dimensions', 'free wattpad cover maker'],
    },
    'discord-banner-maker': {
      title: 'Discord Banner Maker - AI Server Banner Generator | CoverGen Pro',
      description: 'Create professional Discord server banners with AI. Perfect dimensions for server headers, user profiles, and community branding.',
      keywords: ['discord banner maker', 'discord server banner maker', 'discord banner generator', 'discord header creator', 'discord banner dimensions', 'discord server banner', 'discord profile banner'],
    },
    'podcast-cover-maker': {
      title: 'Podcast Cover Maker - AI Podcast Art Generator | CoverGen Pro',
      description: 'Create professional podcast covers with AI. Perfect 3000x3000 dimensions for Apple Podcasts, Spotify, and all major platforms.',
      keywords: ['podcast cover maker', 'podcast cover art maker', 'podcast artwork generator', 'podcast cover design', 'podcast thumbnail creator', 'podcast cover dimensions', 'apple podcast cover'],
    },
    'thumbnail-maker-hub': {
      title: 'Thumbnail Maker Hub - All AI Cover & Thumbnail Tools | CoverGen Pro',
      description: 'Explore our complete collection of AI thumbnail and cover makers. Create professional images for YouTube, TikTok, Spotify, podcasts, and more platforms.',
      keywords: ['thumbnail maker', 'cover maker', 'thumbnail generator', 'youtube thumbnail maker', 'tiktok thumbnail', 'spotify cover maker', 'podcast cover maker', 'ai thumbnail generator', 'free thumbnail maker', 'thumbnail maker no watermark'],
    },
    'kindle-cover-creator': {
      title: 'Kindle Cover Creator - AI eBook Cover Generator | CoverGen Pro',
      description: 'Create professional Kindle book covers with AI. Perfect dimensions for Amazon KDP, genre-specific designs, and instant high-quality generation.',
      keywords: ['kindle cover creator', 'kindle book cover maker', 'amazon kdp cover', 'ebook cover design', 'kindle cover dimensions', 'kindle cover size', 'self publishing cover', 'kdp cover generator'],
    },
    'thumbnail-tester': {
      title: 'Thumbnail Tester - Preview & Optimize Your Thumbnails | CoverGen Pro',
      description: 'Test how your thumbnails look on YouTube, TikTok, and other platforms. Preview different sizes, compare CTR potential, and optimize your thumbnail designs.',
      keywords: ['thumbnail tester', 'thumbnail preview', 'youtube thumbnail tester', 'thumbnail checker', 'thumbnail analyzer', 'ctr optimizer', 'thumbnail comparison tool', 'thumbnail preview tool', 'thumbnail sketch'],
    },
  }

  const data = toolData[tool] || {
    title: `${tool.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} | CoverGen Pro`,
    description: `Create stunning designs with our AI-powered ${tool.replace(/-/g, ' ')} tool.`,
    keywords: [`${tool.replace(/-/g, ' ')}`, 'AI design tool', 'cover maker'],
  }

  return generateMetadata({
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    path: `/tools/${tool}`,
    locale,
    searchParams,
    images: [{
      url: `https://covergen.pro/tools/${tool}-og.jpg`,
      width: 1200,
      height: 630,
      alt: data.title,
    }],
  })
}

// Build canonical metadata for admin pages
export function buildCanonicalMetadata(path: string): Metadata {
  return generateMetadata({
    title: 'Admin Dashboard | CoverGen',
    description: 'CoverGen Admin Dashboard',
    path,
    noindex: true,
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
  locale: Locale = 'en'
): Metadata {
  const metadata = generateMetadata({
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
  })

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      authors: [author],
      publishedTime: publishDate,
      tags,
    },
    other: Object.fromEntries(
      Object.entries({
        ...(metadata.other || {}),
        'article:author': author,
        'article:published_time': publishDate,
        'article:tag': tags.join(','),
      }).filter(([_, value]) => value !== undefined)
    ) as Record<string, string | number | (string | number)[]>,
  }
}