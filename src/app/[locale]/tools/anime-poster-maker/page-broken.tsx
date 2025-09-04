'use client'

import AnimePosterTool from '@/components/tools/AnimePosterTool'

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