#!/usr/bin/env node

/**
 * Migration script to replace existing platform pages with optimized versions
 * This script helps migrate all platform pages to use the new performance-optimized components
 */

const fs = require('fs')
const path = require('path')

const platformsDir = path.join(__dirname, '../src/app/[locale]/platforms')

// Platform configurations for generating optimized pages
const platformConfigs = {
  instagram: {
    name: 'Instagram',
    icon: 'Instagram',
    gradientColors: 'from-pink-500 via-red-500 to-yellow-500',
    primaryColor: '#E1306C',
    features: [
      { icon: 'Grid3x3', title: 'Feed Perfect', description: 'Maintain a cohesive, aesthetic Instagram grid' },
      { icon: 'Image', title: 'Multi-Format', description: 'Posts, stories, reels, and carousel designs' },
      { icon: 'Heart', title: 'Engagement Boost', description: 'Designs optimized for likes and saves' },
      { icon: 'Film', title: 'Reel Ready', description: 'Eye-catching covers for viral reels' }
    ]
  },
  youtube: {
    name: 'YouTube',
    icon: 'Youtube',
    gradientColors: 'from-red-600 to-red-500',
    primaryColor: '#FF0000',
    features: [
      { icon: 'MousePointer2', title: 'Click Magnet', description: 'Thumbnails designed for maximum CTR boost' },
      { icon: 'TrendingUp', title: 'Algorithm Ready', description: 'Optimized for YouTube recommendation system' },
      { icon: 'Eye', title: 'Attention Grabber', description: 'Stand out in crowded subscription feeds' },
      { icon: 'Zap', title: 'Quick Generate', description: 'Professional thumbnails in under 10 seconds' }
    ]
  },
  tiktok: {
    name: 'TikTok',
    icon: 'Music',
    gradientColors: 'from-purple-600 to-pink-600',
    primaryColor: '#000000',
    features: [
      { icon: 'TrendingUp', title: 'Viral Ready', description: 'Designs optimized for TikTok algorithm' },
      { icon: 'Smartphone', title: 'Mobile First', description: 'Perfect vertical format for mobile viewing' },
      { icon: 'Sparkles', title: 'Eye Catching', description: 'Bold designs that stop the scroll' },
      { icon: 'Zap', title: 'Quick Generate', description: 'Viral covers in seconds' }
    ]
  },
  spotify: {
    name: 'Spotify',
    icon: 'Music',
    gradientColors: 'from-green-500 to-green-600',
    primaryColor: '#1DB954',
    features: [
      { icon: 'Music', title: 'Album Perfect', description: 'Professional album and playlist covers' },
      { icon: 'Square', title: 'Square Format', description: 'Optimized 1:1 aspect ratio for Spotify' },
      { icon: 'Headphones', title: 'Music Focused', description: 'Designs that match your sound' },
      { icon: 'Sparkles', title: 'Brand Ready', description: 'Consistent visual identity' }
    ]
  },
  twitch: {
    name: 'Twitch',
    icon: 'Twitch',
    gradientColors: 'from-purple-600 to-purple-700',
    primaryColor: '#9146FF',
    features: [
      { icon: 'Gamepad2', title: 'Gaming Optimized', description: 'Designs perfect for gaming content' },
      { icon: 'Users', title: 'Community Ready', description: 'Builds your streaming brand' },
      { icon: 'Zap', title: 'Stream Ready', description: 'Professional overlays and thumbnails' },
      { icon: 'TrendingUp', title: 'Viewer Magnet', description: 'Thumbnails that boost viewership' }
    ]
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'Linkedin',
    gradientColors: 'from-blue-600 to-blue-700',
    primaryColor: '#0077B5',
    features: [
      { icon: 'Briefcase', title: 'Professional', description: 'Corporate-ready cover designs' },
      { icon: 'Users', title: 'Network Ready', description: 'Builds your professional brand' },
      { icon: 'TrendingUp', title: 'Career Boost', description: 'Stand out to recruiters and connections' },
      { icon: 'Award', title: 'Authority Builder', description: 'Establish thought leadership' }
    ]
  }
}

function generateOptimizedPageTemplate(platformKey, config) {
  const iconsImport = [...new Set(config.features.map(f => f.icon))].join(', ')
  
  return `'use client'

import { lazy, Suspense } from 'react'
import { ${config.icon}, ${iconsImport}, Sparkles } from 'lucide-react'
import { getLightweightKeywords } from '@/lib/seo/lightweight-keywords'
import { platformShowcases } from '@/lib/platform-showcases'

// Lazy load heavy components for better performance
const OptimizedPlatformPage = lazy(() => import('@/components/seo/OptimizedPlatformPage'))
const DynamicPlatformShowcase = lazy(() => import('@/components/seo/DynamicPlatformShowcase'))

const features = ${JSON.stringify(config.features, null, 2).replace(/"icon":\s*"([^"]+)"/g, 'icon: $1')}

const ${platformKey}Config = {
  name: '${config.name}',
  icon: ${config.icon},
  gradientColors: '${config.gradientColors}',
  features,
  showcases: platformShowcases.${platformKey} || [],
  primaryColor: '${config.primaryColor}'
}

// Simple loading component for better perceived performance
function ${config.name}LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="h-12 bg-gray-200 animate-pulse rounded-md max-w-lg mx-auto mb-4" />
        <div className="h-6 bg-gray-200 animate-pulse rounded-md max-w-md mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6">
              <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-2xl mx-auto mb-4" />
              <div className="h-5 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-4 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ${config.name}ContentMakerClient({ 
  locale, 
  translations 
}: { 
  locale: string, 
  translations: any 
}) {
  // Use lightweight keywords for initial render
  const lightweightKeywords = getLightweightKeywords('${platformKey}')

  return (
    <Suspense fallback={<${config.name}LoadingSkeleton />}>
      <OptimizedPlatformPage
        config={${platformKey}Config}
        locale={locale}
      >
        {/* Additional ${config.name}-specific content can go here */}
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-xl" />}>
          <DynamicPlatformShowcase
            platform="${platformKey}"
            showcases={${platformKey}Config.showcases}
            primaryColor={${platformKey}Config.primaryColor}
          />
        </Suspense>
      </OptimizedPlatformPage>
    </Suspense>
  )
}`
}

function backupOriginalFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = filePath.replace('.tsx', '.tsx.backup')
    fs.copyFileSync(filePath, backupPath)
    console.log(`✅ Backed up ${filePath} to ${backupPath}`)
  }
}

function migrateOptimizedPages() {
  console.log('🚀 Starting migration to optimized platform pages...\n')

  if (!fs.existsSync(platformsDir)) {
    console.error(`❌ Platforms directory not found: ${platformsDir}`)
    return
  }

  for (const [platformKey, config] of Object.entries(platformConfigs)) {
    const platformDir = path.join(platformsDir, platformKey)
    const pageClientPath = path.join(platformDir, 'page-client.tsx')
    const optimizedPath = path.join(platformDir, 'page-client-optimized.tsx')

    if (fs.existsSync(platformDir)) {
      // Backup original file
      backupOriginalFile(pageClientPath)

      // Generate optimized page
      const optimizedContent = generateOptimizedPageTemplate(platformKey, config)
      fs.writeFileSync(optimizedPath, optimizedContent)

      console.log(`✅ Created optimized page for ${config.name}: ${optimizedPath}`)
    } else {
      console.log(`⚠️  Platform directory not found: ${platformDir}`)
    }
  }

  console.log('\n🎉 Migration complete! Next steps:')
  console.log('1. Review the generated optimized pages')
  console.log('2. Test the performance improvements')
  console.log('3. Replace the original page-client.tsx files with optimized versions')
  console.log('4. Run `npm run build:analyze` to see bundle size improvements')
}

// Run migration
migrateOptimizedPages()