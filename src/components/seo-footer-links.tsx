import React from 'react'
import Link from 'next/link'

interface SEOFooterLinksProps {
  locale: string
}

export default function SEOFooterLinks({ locale }: SEOFooterLinksProps) {
  const isZh = locale === 'zh'

  const toolCategories = [
    {
      title: isZh ? 'AI 工具' : 'AI Tools',
      links: [
        { href: '/tools/ai-thumbnail-generator-free', label: isZh ? 'AI 缩略图生成器' : 'AI Thumbnail Generator Free' },
        { href: '/tools/instagram-thumbnail-maker', label: isZh ? 'Instagram 缩略图制作' : 'Instagram Thumbnail Maker' },
        { href: '/tools/linkedin-banner-maker', label: isZh ? 'LinkedIn 横幅制作' : 'LinkedIn Banner Maker' },
      ]
    },
    {
      title: isZh ? '社交媒体工具' : 'Social Media Tools',
      links: [
        { href: '/platforms/youtube', label: isZh ? 'YouTube 封面制作' : 'YouTube Cover Maker' },
        { href: '/platforms/tiktok', label: isZh ? 'TikTok 缩略图' : 'TikTok Thumbnail Maker' },
        { href: '/platforms/instagram', label: isZh ? 'Instagram 封面' : 'Instagram Cover Maker' },
        { href: '/tools/social-media-poster', label: isZh ? '社交媒体海报' : 'Social Media Poster' },
      ]
    },
    {
      title: isZh ? '专业工具' : 'Professional Tools',
      links: [
        { href: '/tools/book-cover-creator', label: isZh ? '书籍封面设计' : 'Book Cover Creator' },
        { href: '/tools/music-album-cover', label: isZh ? '音乐专辑封面' : 'Music Album Cover' },
        { href: '/tools/webinar-poster-maker', label: isZh ? '网络研讨会海报' : 'Webinar Poster Maker' },
        { href: '/tools/event-poster-designer', label: isZh ? '活动海报设计' : 'Event Poster Designer' },
      ]
    },
    {
      title: isZh ? '娱乐工具' : 'Entertainment Tools',
      links: [
        { href: '/tools/anime-poster-maker', label: isZh ? '动漫海报制作' : 'Anime Poster Maker' },
        { href: '/tools/game-cover-art', label: isZh ? '游戏封面艺术' : 'Game Cover Art' },
        { href: '/platforms/spotify', label: isZh ? 'Spotify 播放列表封面' : 'Spotify Playlist Cover' },
        { href: '/platforms/twitch', label: isZh ? 'Twitch 缩略图' : 'Twitch Thumbnail Maker' },
      ]
    }
  ]

  const resources = [
    {
      title: isZh ? '学习资源' : 'Learning Resources',
      links: [
        { href: '/tutorials', label: isZh ? '教程指南' : 'Tutorials & Guides' },
        { href: '/blog', label: isZh ? '设计博客' : 'Design Blog' },
        { href: '/showcase', label: isZh ? '作品展示' : 'Design Showcase' },
        { href: '/help', label: isZh ? '帮助中心' : 'Help Center' },
      ]
    }
  ]

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {toolCategories.map((category, index) => (
            <div key={index}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                {category.title}
              </h3>
              <ul className="space-y-2">
                {category.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={`/${locale}${link.href}`}
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {resources.map((category, index) => (
            <div key={index}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                {category.title}
              </h3>
              <ul className="space-y-2">
                {category.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={`/${locale}${link.href}`}
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* SEO Description */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-4xl mx-auto">
            {isZh 
              ? 'CoverGen Pro 提供专业的 AI 驱动设计工具，为内容创作者提供免费的缩略图生成器、封面制作器和海报设计工具。支持 YouTube、TikTok、Instagram、LinkedIn 等所有主流平台。'
              : 'CoverGen Pro offers professional AI-powered design tools for content creators. Free thumbnail generators, cover makers, and poster designers for YouTube, TikTok, Instagram, LinkedIn, and all major platforms.'}
          </p>
        </div>
      </div>
    </div>
  )
}