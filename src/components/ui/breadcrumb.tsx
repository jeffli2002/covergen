'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

export interface BreadcrumbItem {
  name: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav 
      className={`flex ${className}`}
      aria-label="Breadcrumb"
    >
      <ol 
        className="flex items-center space-x-2 text-sm"
        itemScope 
        itemType="https://schema.org/BreadcrumbList"
      >
        {/* Home icon */}
        <li 
          className="flex items-center"
          itemProp="itemListElement" 
          itemScope 
          itemType="https://schema.org/ListItem"
        >
          <Link 
            href="/"
            className="text-gray-500 hover:text-gray-700"
            itemProp="item"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only" itemProp="name">Home</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {items.map((item, index) => (
          <Fragment key={item.name}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li 
              className="flex items-center"
              itemProp="itemListElement" 
              itemScope 
              itemType="https://schema.org/ListItem"
            >
              {item.current || !item.href ? (
                <span 
                  className="text-gray-700 font-medium"
                  aria-current={item.current ? 'page' : undefined}
                  itemProp="name"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700"
                  itemProp="item"
                >
                  <span itemProp="name">{item.name}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(index + 2)} />
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}

// Breadcrumb wrapper with proper background and spacing
export function BreadcrumbWrapper({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`bg-gray-50 border-b border-gray-200 ${className}`}>
      <div className="container mx-auto px-4 py-3">
        {children}
      </div>
    </div>
  )
}

// Helper function to generate breadcrumb items from pathname
export function generateBreadcrumbItems(pathname: string, locale: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []
  
  // Remove locale from segments if it's the first one
  if (segments[0] === locale) {
    segments.shift()
  }
  
  // Build breadcrumb items
  let currentPath = `/${locale}`
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Format segment name
    let name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    // Special cases for known segments
    const specialNames: Record<string, string> = {
      'platforms': 'Platforms',
      'tools': 'Tools',
      'youtube': 'YouTube',
      'tiktok': 'TikTok',
      'instagram': 'Instagram',
      'spotify': 'Spotify',
      'twitch': 'Twitch',
      'linkedin': 'LinkedIn',
      'wechat': 'WeChat',
      'xiaohongshu': 'Xiaohongshu',
      'anime-poster-maker': 'Anime Poster Maker',
      'bilibili-video-cover': 'Bilibili Video Cover',
      'spotify-playlist-cover': 'Spotify Playlist Cover',
      'facebook-event-cover': 'Facebook Event Cover',
      'social-media-poster': 'Social Media Poster',
      'book-cover-creator': 'Book Cover Creator',
      'game-cover-art': 'Game Cover Art',
      'webinar-poster-maker': 'Webinar Poster Maker',
      'event-poster-designer': 'Event Poster Designer',
      'music-album-cover': 'Music Album Cover',
    }
    
    if (specialNames[segment]) {
      name = specialNames[segment]
    }
    
    items.push({
      name,
      href: index === segments.length - 1 ? undefined : currentPath,
      current: index === segments.length - 1
    })
  })
  
  return items
}