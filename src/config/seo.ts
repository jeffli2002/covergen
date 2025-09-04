// Import merged keywords for dynamic SEO
import { getAllKeywords, getPlatformKeywords } from '@/lib/seo/platform-keywords';
import { getKeywordsByDifficulty, getHighGrowthKeywords } from '@/lib/seo/enhanced-keywords';
import { getHighOpportunityKeywords } from '@/lib/seo/keyword-merger';

// Get dynamic keywords
const highOpportunityKeywords = getHighOpportunityKeywords().slice(0, 20).map(k => k.keyword);
const trendingKeywords = getHighGrowthKeywords(200).slice(0, 15).map(k => k.keyword);

export const seoConfig = {
  siteName: 'CoverGen Pro',
  siteUrl: 'https://covergen.pro',
  siteDescription: 'AI-powered cover and thumbnail generator with nano banana technology for content creators across YouTube, TikTok, Spotify, and more platforms.',
  siteKeywords: [
    // High opportunity keywords (low competition + high volume)
    ...highOpportunityKeywords,
    
    // Trending AI keywords (200%+ growth)
    ...trendingKeywords,
    // Core keywords
    'cover',
    'cover image',
    'cover maker',
    'cover image generator',
    'thumbnail',
    'thumbnail maker',
    'thumbnail maker',
    'youtube thumbnail maker',
    'youtube thumbnail maker',
    'youtube cover maker',
    'poster',
    'poster maker',
    'poster image maker',
    'poster image generator',
    'tiktok thumbnail maker',
    
    // AI and Technology
    'AI cover generator',
    'AI thumbnail maker',
    'AI poster generator',
    'AI design tool',
    'nano banana',
    'Google Gemini 2.5 Flash',
    'Gemini Flash AI',
    
    // Platform specific - YouTube
    'YouTube thumbnail maker',
    'YouTube thumbnail generator',
    'YouTube cover maker',
    'YouTube cover creator',
    'YouTube poster maker',
    'YouTube thumbnail designer',
    'YouTube cover image generator',
    'YouTube poster image maker',
    
    // Platform specific - TikTok
    'TikTok cover creator',
    'TikTok thumbnail maker',
    'TikTok thumbnail generator',
    'TikTok cover maker',
    'TikTok poster maker',
    'TikTok cover image generator',
    'TikTok thumbnail designer',
    'TikTok poster image maker',
    
    // Platform specific - Spotify
    'Spotify cover art',
    'Spotify cover maker',
    'Spotify thumbnail maker',
    'Spotify poster maker',
    'Spotify cover image generator',
    'Spotify album cover maker',
    'Spotify playlist cover maker',
    'Spotify poster image generator',
    
    // Platform specific - Instagram
    'Instagram post designer',
    'Instagram cover maker',
    'Instagram thumbnail maker',
    'Instagram poster maker',
    'Instagram story cover maker',
    'Instagram post image generator',
    'Instagram cover image maker',
    'Instagram poster image generator',
    
    // Platform specific - Twitch
    'Twitch thumbnail generator',
    'Twitch cover maker',
    'Twitch thumbnail maker',
    'Twitch poster maker',
    'Twitch stream cover maker',
    'Twitch thumbnail designer',
    'Twitch cover image generator',
    'Twitch poster image maker',
    
    // Platform specific - LinkedIn
    'LinkedIn cover maker',
    'LinkedIn thumbnail maker',
    'LinkedIn poster maker',
    'LinkedIn cover image generator',
    'LinkedIn banner maker',
    'LinkedIn header maker',
    'LinkedIn poster image generator',
    'LinkedIn cover creator',
    
    // Platform specific - Twitter/X
    'Twitter cover maker',
    'Twitter thumbnail maker',
    'Twitter poster maker',
    'Twitter cover image generator',
    'Twitter header maker',
    'Twitter banner maker',
    'Twitter poster image generator',
    'X cover maker',
    'X thumbnail maker',
    'X poster maker',
    
    // Platform specific - Facebook
    'Facebook cover maker',
    'Facebook thumbnail maker',
    'Facebook poster maker',
    'Facebook cover image generator',
    'Facebook page cover maker',
    'Facebook group cover maker',
    'Facebook poster image generator',
    'Facebook cover creator',
    
    // Platform specific - Pinterest
    'Pinterest cover maker',
    'Pinterest thumbnail maker',
    'Pinterest poster maker',
    'Pinterest pin cover maker',
    'Pinterest cover image generator',
    'Pinterest board cover maker',
    'Pinterest poster image generator',
    'Pinterest cover creator',
    
    // Platform specific - Snapchat
    'Snapchat cover maker',
    'Snapchat thumbnail maker',
    'Snapchat poster maker',
    'Snapchat story cover maker',
    'Snapchat cover image generator',
    'Snapchat poster image generator',
    'Snapchat cover creator',
    
    // Platform specific - Discord
    'Discord cover maker',
    'Discord thumbnail maker',
    'Discord poster maker',
    'Discord server cover maker',
    'Discord cover image generator',
    'Discord banner maker',
    'Discord poster image generator',
    'Discord cover creator',
    
    // Platform specific - Reddit
    'Reddit cover maker',
    'Reddit thumbnail maker',
    'Reddit poster maker',
    'Reddit subreddit cover maker',
    'Reddit cover image generator',
    'Reddit banner maker',
    'Reddit poster image generator',
    'Reddit cover creator',
    
    // Platform specific - Chinese Platforms
    'Xiaohongshu cover maker',
    'Xiaohongshu thumbnail maker',
    'Xiaohongshu poster maker',
    'RED note cover maker',
    'Little Red Book cover maker',
    '小红书封面制作器',
    '小红书缩略图制作器',
    '小红书海报制作器',
    
    'WeChat cover maker',
    'WeChat thumbnail maker',
    'WeChat poster maker',
    'WeChat moments cover maker',
    'WeChat article cover maker',
    '微信封面制作器',
    '微信缩略图制作器',
    '微信海报制作器',
    
    'Weibo cover maker',
    'Weibo thumbnail maker',
    'Weibo poster maker',
    '微博封面制作器',
    '微博缩略图制作器',
    '微博海报制作器',
    
    'Bilibili cover maker',
    'Bilibili thumbnail maker',
    'Bilibili poster maker',
    'B站封面制作器',
    'B站缩略图制作器',
    'B站海报制作器',
    
    'Douyin cover maker',
    'Douyin thumbnail maker',
    'Douyin poster maker',
    '抖音封面制作器',
    '抖音缩略图制作器',
    '抖音海报制作器',
    
    // Platform specific - Other Social Media
    'Telegram cover maker',
    'Telegram thumbnail maker',
    'Telegram poster maker',
    'Telegram channel cover maker',
    'Telegram cover image generator',
    'Telegram poster image generator',
    
    'WhatsApp cover maker',
    'WhatsApp thumbnail maker',
    'WhatsApp poster maker',
    'WhatsApp status cover maker',
    'WhatsApp cover image generator',
    'WhatsApp poster image generator',
    
    'Tumblr cover maker',
    'Tumblr thumbnail maker',
    'Tumblr poster maker',
    'Tumblr blog cover maker',
    'Tumblr cover image generator',
    'Tumblr poster image generator',
    
    'Medium cover maker',
    'Medium thumbnail maker',
    'Medium poster maker',
    'Medium article cover maker',
    'Medium cover image generator',
    'Medium poster image generator',
    
    'Substack cover maker',
    'Substack thumbnail maker',
    'Substack poster maker',
    'Substack newsletter cover maker',
    'Substack cover image generator',
    'Substack poster image generator',
    
    // Platform specific - E-commerce
    'Amazon cover maker',
    'Amazon thumbnail maker',
    'Amazon poster maker',
    'Amazon product cover maker',
    'Amazon cover image generator',
    'Amazon poster image generator',
    
    'Etsy cover maker',
    'Etsy thumbnail maker',
    'Etsy poster maker',
    'Etsy listing cover maker',
    'Etsy cover image generator',
    'Etsy poster image generator',
    
    'Shopify cover maker',
    'Shopify thumbnail maker',
    'Shopify poster maker',
    'Shopify product cover maker',
    'Shopify cover image generator',
    'Shopify poster image generator',
    
    // Platform specific - Professional
    'Behance cover maker',
    'Behance thumbnail maker',
    'Behance poster maker',
    'Behance project cover maker',
    'Behance cover image generator',
    'Behance poster image generator',
    
    'Dribbble cover maker',
    'Dribbble thumbnail maker',
    'Dribbble poster maker',
    'Dribbble shot cover maker',
    'Dribbble cover image generator',
    'Dribbble poster image generator',
    
    'Figma cover maker',
    'Figma thumbnail maker',
    'Figma poster maker',
    'Figma file cover maker',
    'Figma cover image generator',
    'Figma poster image generator',
    
    // Feature keywords
    'instant cover generation',
    'AI-powered design',
    'professional cover design',
    'social media covers',
    'content creator tools',
    'cover art generator',
    'thumbnail template maker',
    'multi-platform cover creator',
    
    // Long-tail keywords
    'free AI thumbnail generator',
    'professional YouTube thumbnail maker',
    'viral TikTok cover designer',
    'Spotify album cover creator',
    'social media thumbnail size guide',
    'best AI cover generator 2025',
    
    // Brand variations
    'CoverGen Pro',
    'Cover Generator AI',
    'covergen.pro',
  ],
  
  // Social media handles
  social: {
    twitter: '@covergenai',
    linkedin: 'covergenai',
    github: 'covergenai',
    youtube: '@covergenai',
  },
  
  // Default Open Graph images
  defaultOgImage: {
    url: 'https://covergen.pro/og-image.png',
    width: 1200,
    height: 630,
    alt: 'CoverGen Pro - AI-Powered Cover Generator',
  },
  
  // Twitter card image
  twitterImage: {
    url: 'https://covergen.pro/twitter-image.png',
    alt: 'CoverGen Pro - Create stunning covers with AI',
  },
  
  // Verification codes (replace with actual codes)
  verification: {
    google: 'your-google-verification-code',
    bing: 'your-bing-verification-code',
    pinterest: 'your-pinterest-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  
  // Analytics IDs (replace with actual IDs)
  analytics: {
    googleAnalytics: 'G-XXXXXXXXXX',
    facebookPixel: 'XXXXXXXXXXXXXXX',
    hotjar: 'XXXXXXX',
  },
  
  // Language configuration
  languages: [
    { code: 'en', name: 'English', region: 'US' },
    { code: 'es', name: 'Español', region: 'ES' },
    { code: 'pt', name: 'Português', region: 'BR' },
    { code: 'zh', name: '中文', region: 'CN' },
    { code: 'ar', name: 'العربية', region: 'SA' },
  ],
  
  // Platform-specific SEO data
  platforms: {
    youtube: {
      title: 'YouTube Thumbnail Maker - AI-Powered Thumbnail Generator',
      description: 'Create eye-catching YouTube thumbnails in seconds with AI and nano banana technology. Boost your CTR by 40% with professional thumbnails optimized for YouTube\'s algorithm.',
      keywords: [
        'YouTube thumbnail maker',
        'YouTube thumbnail generator', 
        'YouTube cover maker',
        'YouTube cover creator',
        'YouTube poster maker',
        'YouTube thumbnail designer',
        'YouTube cover image generator',
        'YouTube poster image maker',
        'youtube thumbnail maker',
        'youtube cover maker',
        'YouTube thumbnail size',
        'clickbait thumbnail generator',
        'YouTube thumbnail templates',
        'free thumbnail maker',
        'YouTube thumbnail ideas'
      ],
    },
    tiktok: {
      title: 'TikTok Cover Creator - AI Cover Generator for TikTok',
      description: 'Design viral TikTok covers with AI-powered generation using nano banana technology. Perfect dimensions and styles for maximum engagement on TikTok.',
      keywords: [
        'TikTok cover maker',
        'TikTok thumbnail maker',
        'TikTok thumbnail generator',
        'TikTok cover creator',
        'TikTok poster maker',
        'TikTok cover image generator',
        'TikTok thumbnail designer',
        'TikTok poster image maker',
        'tiktok thumbnail maker',
        'TikTok cover design',
        'viral TikTok covers',
        'TikTok cover size',
        'TikTok cover templates',
        'mobile video covers',
        'TikTok content creator tools'
      ],
    },
    spotify: {
      title: 'Spotify Cover Art Generator - AI Music Cover Designer',
      description: 'Create professional Spotify cover art with AI and nano banana algorithms. Perfect 3000x3000 album covers that meet Spotify\'s guidelines.',
      keywords: [
        'Spotify cover art',
        'Spotify cover maker',
        'Spotify thumbnail maker',
        'Spotify poster maker',
        'Spotify cover image generator',
        'Spotify album cover maker',
        'Spotify playlist cover maker',
        'Spotify poster image generator',
        'album cover maker',
        'music cover generator',
        'album art creator',
        'Spotify cover design',
        'music cover design',
        'album artwork creator',
        'Spotify playlist cover'
      ],
    },
    twitch: {
      title: 'Twitch Thumbnail Designer - Stream Cover Generator',
      description: 'Generate professional Twitch thumbnails and stream covers with AI nano banana technology. Optimized for Twitch\'s platform requirements.',
      keywords: [
        'Twitch thumbnail maker',
        'Twitch cover maker',
        'Twitch thumbnail generator',
        'Twitch poster maker',
        'Twitch stream cover maker',
        'Twitch thumbnail designer',
        'Twitch cover image generator',
        'Twitch poster image generator',
        'stream thumbnail generator',
        'gaming thumbnail maker',
        'Twitch overlay creator',
        'gaming cover maker',
        'stream cover design',
        'Twitch thumbnail size',
        'gaming thumbnail templates'
      ],
    },
    instagram: {
      title: 'Instagram Post Designer - AI Cover Maker for Instagram',
      description: 'Create stunning Instagram posts and story covers with AI-powered nano banana generation. Perfect square and story dimensions.',
      keywords: [
        'Instagram post maker',
        'Instagram cover maker',
        'Instagram thumbnail maker',
        'Instagram poster maker',
        'Instagram story cover maker',
        'Instagram post image generator',
        'Instagram cover image maker',
        'Instagram poster image generator',
        'Instagram post designer',
        'Instagram story designer',
        'Instagram thumbnail generator',
        'square post design',
        'Instagram story cover',
        'Instagram post templates',
        'Instagram cover design'
      ],
    },
    linkedin: {
      title: 'LinkedIn Cover Creator - Professional Cover Generator',
      description: 'Design professional LinkedIn cover images with AI and nano banana technology. Perfect for personal branding and company pages.',
      keywords: [
        'LinkedIn cover maker',
        'LinkedIn thumbnail maker',
        'LinkedIn poster maker',
        'LinkedIn cover image generator',
        'LinkedIn banner maker',
        'LinkedIn header maker',
        'LinkedIn poster image generator',
        'LinkedIn cover creator',
        'professional cover generator',
        'LinkedIn header designer',
        'LinkedIn banner creator',
        'professional cover design',
        'LinkedIn cover size',
        'LinkedIn profile cover',
        'business cover maker'
      ],
    },
    xiaohongshu: {
      title: 'Xiaohongshu Cover Maker - RED Note Cover Generator',
      description: 'Create engaging Xiaohongshu (Little Red Book) covers with AI nano banana generation. Optimized for Chinese social media engagement.',
      keywords: [
        'Xiaohongshu cover maker',
        'Xiaohongshu thumbnail maker',
        'Xiaohongshu poster maker',
        'RED note cover maker',
        'Little Red Book cover maker',
        '小红书封面制作器',
        '小红书缩略图制作器',
        '小红书海报制作器',
        'Xiaohongshu cover',
        'RED note cover',
        'Little Red Book cover',
        'Chinese social media cover',
        '小红书封面设计',
        '小红书笔记封面',
        '小红书封面模板'
      ],
    },
    wechat: {
      title: 'WeChat Moments Cover Designer - AI Cover Generator',
      description: 'Design beautiful WeChat Moments covers with AI-powered nano banana technology. Perfect for WeChat articles and moments.',
      keywords: [
        'WeChat cover maker',
        'WeChat thumbnail maker',
        'WeChat poster maker',
        'WeChat moments cover maker',
        'WeChat article cover maker',
        '微信封面制作器',
        '微信缩略图制作器',
        '微信海报制作器',
        'WeChat cover',
        'WeChat moments cover',
        'WeChat article cover',
        'Chinese social media design',
        '微信朋友圈封面',
        '微信公众号封面',
        '微信封面设计'
      ],
    },
  },
}