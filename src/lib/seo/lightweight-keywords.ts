// Lightweight SEO keywords for initial page load
// Full keywords are loaded dynamically only when needed

export const CORE_KEYWORDS = {
  // Essential keywords loaded immediately
  general: [
    'AI cover generator',
    'thumbnail maker',
    'poster generator',
    'social media covers',
    'content creator tools',
  ],
  
  // Platform-specific core keywords (minimal set)
  platforms: {
    youtube: [
      'YouTube thumbnail maker',
      'youtube cover maker',
      'clickbait thumbnail generator',
      'free thumbnail maker',
      'YouTube thumbnail size',
    ],
    tiktok: [
      'TikTok cover maker',
      'tiktok thumbnail maker',
      'vertical video thumbnail',
      'viral TikTok covers',
      'mobile video covers',
    ],
    instagram: [
      'Instagram post maker',
      'instagram story creator',
      'Instagram reel cover',
      'square image generator',
      'Instagram content creator',
    ],
    spotify: [
      'Spotify cover art',
      'playlist cover maker',
      'album artwork generator',
      'music cover design',
      'square album cover',
    ],
    twitch: [
      'Twitch thumbnail maker',
      'stream overlay creator',
      'gaming thumbnail generator',
      'Twitch cover design',
      'stream banner maker',
    ],
    linkedin: [
      'LinkedIn cover creator',
      'professional banner maker',
      'LinkedIn header design',
      'business cover generator',
      'corporate banner creator',
    ],
  }
}

// Platform keyword counts for SEO metrics
export const PLATFORM_KEYWORD_COUNTS = {
  youtube: 55,
  tiktok: 37,
  instagram: 45,
  spotify: 42,
  twitch: 38,
  linkedin: 41,
  wechat: 35,
  bilibili: 33,
  rednote: 29,
} as const

// Dynamic keyword loader - loads full keywords only when needed
export async function loadFullPlatformKeywords(platform: string) {
  try {
    // Dynamic import - only loads when called
    const { PLATFORM_KEYWORDS } = await import('./platform-keywords')
    return PLATFORM_KEYWORDS[platform as keyof typeof PLATFORM_KEYWORDS] || []
  } catch (error) {
    console.error(`Failed to load keywords for ${platform}:`, error)
    return CORE_KEYWORDS.platforms[platform as keyof typeof CORE_KEYWORDS.platforms] || []
  }
}

// Get lightweight keywords for initial page load
export function getLightweightKeywords(platform: string): string[] {
  const coreGeneral = CORE_KEYWORDS.general
  const corePlatform = CORE_KEYWORDS.platforms[platform as keyof typeof CORE_KEYWORDS.platforms] || []
  
  return [...coreGeneral, ...corePlatform]
}

// Generate meta description with lightweight keywords
export function generateLightweightDescription(platform: string): string {
  const descriptions: Record<string, string> = {
    youtube: 'Create eye-catching YouTube thumbnails in seconds with AI. Boost your CTR with professional thumbnails optimized for YouTube.',
    tiktok: 'Design viral TikTok covers that boost engagement. AI-powered vertical cover generation optimized for TikTok.',
    instagram: 'Create stunning Instagram posts, stories, and reels. AI-powered square format designs for maximum engagement.',
    spotify: 'Generate professional Spotify album covers and playlist artwork. AI-powered square format designs.',
    twitch: 'Create engaging Twitch thumbnails and stream overlays. AI-powered designs optimized for gaming content.',
    linkedin: 'Design professional LinkedIn covers and banners. AI-powered business-focused designs.',
    wechat: 'Generate WeChat Channels covers with AI. Professional vertical format designs.',
    bilibili: 'Create Bilibili video covers with AI. Optimized for Chinese video platform.',
    rednote: 'Design aesthetic Rednote covers with AI. Perfect for lifestyle and beauty content.',
  }
  
  return descriptions[platform] || 'AI-powered cover and thumbnail generator for content creators'
}

// SEO performance optimizations
export const SEO_PERFORMANCE_CONFIG = {
  // Lazy load full keywords after initial render
  keywordLoadDelay: 100,
  
  // Batch size for keyword processing
  keywordBatchSize: 50,
  
  // Priority loading for critical platforms
  priorityPlatforms: ['youtube', 'tiktok', 'instagram'],
  
  // Cache duration for loaded keywords
  keywordCacheDuration: 1000 * 60 * 10, // 10 minutes
} as const