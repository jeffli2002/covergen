import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://covergen.pro'
  const currentDate = new Date().toISOString()
  
  // Define all static routes with multi-language support
  const staticRoutes = [
    {
      url: `${baseUrl}/en`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
      alternates: {
        languages: generateLanguageAlternates(''),
      },
    },
    {
      url: `${baseUrl}/en/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: generateLanguageAlternates('/pricing'),
      },
    },
    {
      url: `${baseUrl}/en/tutorials`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: generateLanguageAlternates('/tutorials'),
      },
    },
    {
      url: `${baseUrl}/en/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
      alternates: {
        languages: generateLanguageAlternates('/blog'),
      },
    },
    {
      url: `${baseUrl}/en/showcase`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      alternates: {
        languages: generateLanguageAlternates('/showcase'),
      },
    },
    {
      url: `${baseUrl}/en/help`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        languages: generateLanguageAlternates('/help'),
      },
    },
    {
      url: `${baseUrl}/en/support`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: {
        languages: generateLanguageAlternates('/support'),
      },
    },
    {
      url: `${baseUrl}/en/feedback`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: {
        languages: generateLanguageAlternates('/feedback'),
      },
    },
    {
      url: `${baseUrl}/en/status`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.5,
      alternates: {
        languages: generateLanguageAlternates('/status'),
      },
    },
    {
      url: `${baseUrl}/en/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: {
        languages: generateLanguageAlternates('/terms'),
      },
    },
    {
      url: `${baseUrl}/en/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: {
        languages: generateLanguageAlternates('/privacy'),
      },
    },
    {
      url: `${baseUrl}/en/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: {
        languages: generateLanguageAlternates('/cookies'),
      },
    },
    {
      url: `${baseUrl}/en/accessibility`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: {
        languages: generateLanguageAlternates('/accessibility'),
      },
    },
    {
      url: `${baseUrl}/en/refund`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
      alternates: {
        languages: generateLanguageAlternates('/refund'),
      },
    },
    {
      url: `${baseUrl}/en/account`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
      alternates: {
        languages: generateLanguageAlternates('/account'),
      },
    },
    {
      url: `${baseUrl}/en/payment`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        languages: generateLanguageAlternates('/payment'),
      },
    },
    {
      url: `${baseUrl}/en/tools`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: generateLanguageAlternates('/tools'),
      },
    },
    {
      url: `${baseUrl}/en/platforms`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: generateLanguageAlternates('/platforms'),
      },
    },
  ]
  
  // Platform-specific pages with proper priorities and keywords focus
  const platforms = [
    { name: 'youtube', priority: 0.95 }, // Higher priority for popular platforms
    { name: 'tiktok', priority: 0.95 }, // High demand platform
    { name: 'instagram', priority: 0.9 },
    { name: 'spotify', priority: 0.9 },
    { name: 'twitch', priority: 0.9 },
    { name: 'linkedin', priority: 0.85 },
    { name: 'wechat', priority: 0.85 },
    { name: 'rednote', priority: 0.85 },
  ]
  
  const platformRoutes = platforms.flatMap((platform) => [
    {
      url: `${baseUrl}/en/platforms/${platform.name}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: platform.priority,
      alternates: {
        languages: generateLanguageAlternates(`/platforms/${platform.name}`),
      },
    },
  ])
  
  // Tool-specific pages with SEO focus on low-KD keywords
  const tools = [
    // Ultra-low competition keywords (KD < 30) - HIGHEST PRIORITY
    { name: 'instagram-thumbnail-maker', priority: 0.95 }, // KD: 10
    { name: 'linkedin-banner-maker', priority: 0.95 }, // KD: 7
    { name: 'youtube-thumbnail-ideas', priority: 0.93 }, // KD: 22
    // Existing tools
    { name: 'anime-poster-maker', priority: 0.8 },
    { name: 'spotify-playlist-cover', priority: 0.85 },
    { name: 'facebook-event-cover', priority: 0.8 },
    { name: 'social-media-poster', priority: 0.85 },
    { name: 'book-cover-creator', priority: 0.85 },
    { name: 'game-cover-art', priority: 0.8 },
    { name: 'webinar-poster-maker', priority: 0.75 },
    { name: 'event-poster-designer', priority: 0.75 },
    { name: 'music-album-cover', priority: 0.85 },
  ]
  
  const toolRoutes = tools.flatMap((tool) => [
    {
      url: `${baseUrl}/en/tools/${tool.name}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: tool.priority,
      alternates: {
        languages: generateLanguageAlternates(`/tools/${tool.name}`),
      },
    },
  ])
  
  // Combine all routes
  return [...staticRoutes, ...platformRoutes, ...toolRoutes]
}

// Helper function to generate language alternates
function generateLanguageAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {}
  
  // Since we only support English now, we just return the English URL
  i18n.locales.forEach((locale) => {
    alternates[locale.code] = `https://covergen.pro/${locale.code}${path}`
  })
  
  return alternates
}