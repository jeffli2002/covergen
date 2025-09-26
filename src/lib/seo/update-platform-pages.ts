// This file contains the metadata configurations for updating platform pages
// It's used as a reference for updating the platform pages to use the centralized metadata system

export const platformPageUpdates = {
  spotify: {
    title: 'Spotify Playlist Cover Maker - AI Cover Art Generator | CoverGen Pro',
    description: 'Create stunning Spotify playlist covers and podcast artwork with AI. Stand out with professional cover art that gets more streams and followers.',
    keywords: [
      'Spotify playlist cover maker',
      'Spotify cover art generator',
      'playlist cover design',
      'Spotify canvas maker',
      'podcast cover creator',
      'album art generator',
      'Spotify playlist art',
      'music cover designer',
      'Spotify branding',
      'playlist aesthetic',
      'Spotify cover maker free',
      'Spotify playlist cover size',
      'Spotify album cover maker',
      'free Spotify cover art',
      'Spotify cover no watermark'
    ],
  },
  twitch: {
    title: 'Twitch Thumbnail Designer - Stream Cover Generator | CoverGen Pro',
    description: 'Generate professional Twitch thumbnails and stream covers with AI. Optimize your stream visibility with eye-catching graphics.',
    keywords: [
      'Twitch thumbnail maker',
      'Twitch stream cover',
      'Twitch overlay maker',
      'stream thumbnail generator',
      'Twitch banner creator',
      'gaming thumbnail designer',
      'Twitch graphics maker',
      'stream cover art',
      'Twitch channel art',
      'gaming stream graphics',
      'free Twitch thumbnail maker',
      'Twitch thumbnail size',
      'Twitch cover template',
      'stream thumbnail ideas'
    ],
  },
  linkedin: {
    title: 'LinkedIn Cover Creator - Professional Banner Maker | CoverGen Pro',
    description: 'Design professional LinkedIn cover images and banners with AI. Perfect for personal branding and company pages.',
    keywords: [
      'LinkedIn cover maker',
      'LinkedIn banner creator',
      'LinkedIn background image',
      'professional cover photo',
      'LinkedIn header design',
      'business banner maker',
      'LinkedIn profile cover',
      'corporate cover design',
      'LinkedIn company banner',
      'professional branding',
      'free LinkedIn cover maker',
      'LinkedIn cover size',
      'LinkedIn banner dimensions'
    ],
  },
  wechat: {
    title: 'WeChat Moments Cover Designer - AI Cover Generator | CoverGen Pro',
    description: 'Design beautiful WeChat Moments covers and article headers with AI. Perfect for WeChat marketing and personal branding.',
    keywords: [
      'WeChat cover maker',
      'WeChat moments cover',
      'WeChat article cover',
      'WeChat banner design',
      'Chinese social media cover',
      'WeChat marketing graphics',
      'WeChat official account cover',
      'WeChat mini program cover',
      'WeChat story cover',
      'WeChat branding',
      'free WeChat cover maker',
      '微信封面制作'
    ],
  },
  rednote: {
    title: 'RedNote Cover Maker - Little Red Book Cover Generator | CoverGen Pro',
    description: 'Create engaging RedNote (Xiaohongshu) covers with AI. Optimized for Chinese social media engagement and discovery.',
    keywords: [
      'RedNote cover maker',
      'Xiaohongshu cover',
      'Little Red Book cover',
      '小红书封面制作',
      'RedNote thumbnail',
      'Chinese social media cover',
      'Xiaohongshu graphics',
      'RedNote post design',
      'RedNote marketing',
      'RedNote aesthetic',
      'free RedNote cover maker',
      '小红书封面生成器'
    ],
  },
  bilibili: {
    title: 'Bilibili Cover Maker - AI Video Cover Generator | CoverGen Pro',
    description: 'Create eye-catching Bilibili video covers with AI. Boost your video views with covers optimized for Bilibili\'s algorithm.',
    keywords: [
      'Bilibili cover maker',
      'Bilibili thumbnail generator',
      'Bilibili video cover',
      'B站封面制作',
      'Bilibili banner design',
      'Chinese video cover',
      'Bilibili UP主工具',
      'Bilibili marketing',
      'anime cover maker',
      'gaming video cover',
      'free Bilibili cover maker',
      'B站视频封面'
    ],
  },
  platforms: {
    title: 'AI Cover Makers for All Platforms | CoverGen Pro',
    description: 'Create stunning covers for YouTube, TikTok, Instagram, Spotify, and more. One-stop AI cover generator for all social media platforms.',
    keywords: [
      'AI cover maker',
      'social media cover generator',
      'multi-platform cover maker',
      'thumbnail generator',
      'cover design tool',
      'social media graphics',
      'content creator tools',
      'AI thumbnail maker',
      'free cover maker',
      'online cover generator',
      'all platform covers',
      'social media marketing tools'
    ],
  }
}

// Template for updating platform pages to use centralized metadata
export const updateTemplate = `
import { generatePlatformMetadata } from '@/lib/seo/metadata'

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  const metadata = generatePlatformMetadata('PLATFORM_NAME', locale, searchParams)
  
  // Override with platform-specific optimizations
  return {
    ...metadata,
    title: 'CUSTOM_TITLE',
    description: 'CUSTOM_DESCRIPTION',
    keywords: [KEYWORDS].join(', '),
  }
}
`