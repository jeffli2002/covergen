'use client'

import dynamic from 'next/dynamic'

const AnimePosterTool = dynamic(() => import('@/components/tools/AnimePosterTool'), {

import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
})

export default function AnimePosterMakerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Anime Poster Maker</h1>
        <AnimePosterTool />
      </div>
    </div>
  )
}