'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Sparkles, Camera } from 'lucide-react'
import Link from 'next/link'

interface ComparisonItem {
  title: string
  original: {
    src: string
    alt: string
  }
  aiGenerated: {
    src: string
    alt: string
  }
  prompt: string
  style: string
}

interface PlatformComparisonProps {
  platform: string
  comparisons: ComparisonItem[]
  platformDescription: string
  aspectRatio?: 'video' | 'square' | 'vertical'
}

export default function PlatformComparison({ 
  platform, 
  comparisons, 
  platformDescription,
  aspectRatio = 'video' 
}: PlatformComparisonProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const currentItem = comparisons[selectedIndex]

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % comparisons.length)
  }

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + comparisons.length) % comparisons.length)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transform Any Image into {platform} Content
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {platformDescription}
            </p>
          </div>

          {/* Main Comparison Display */}
          <div className="mb-12">
            {/* Title and Details */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">{currentItem.title}</h3>
              <p className="text-gray-600 mb-2">Style: {currentItem.style}</p>
            </div>

            {/* Side by Side Images */}
            <div className={`grid gap-6 mb-8 ${
              aspectRatio === 'vertical' 
                ? 'grid-cols-2 md:grid-cols-2 max-w-4xl mx-auto' 
                : 'grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto'
            }`}>
              {/* Original Image */}
              <div>
                <Card className="overflow-hidden">
                  <div className={`relative ${
                    aspectRatio === 'vertical' ? 'aspect-[9/16]' : 
                    aspectRatio === 'square' ? 'aspect-square' : 
                    'aspect-video'
                  }`}>
                    <img
                      src={currentItem.original.src}
                      alt={currentItem.original.alt}
                      className="w-full h-full object-cover"
                    />
                    {/* Label */}
                    <div className="absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-semibold bg-gray-900 text-white">
                      <Camera className="w-4 h-4 inline mr-2" />
                      Original Photo
                    </div>
                  </div>
                </Card>
              </div>

              {/* AI Generated Image */}
              <div>
                <Card className="overflow-hidden">
                  <div className={`relative ${
                    aspectRatio === 'vertical' ? 'aspect-[9/16]' : 
                    aspectRatio === 'square' ? 'aspect-square' : 
                    'aspect-video'
                  }`}>
                    <img
                      src={currentItem.aiGenerated.src}
                      alt={currentItem.aiGenerated.alt}
                      className="w-full h-full object-cover brightness-110 contrast-125 saturate-150"
                    />
                    {/* Label */}
                    <div className="absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      AI Generated
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Prompt and Details */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-100 rounded-xl p-6 mb-6">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                  AI Generation Prompt
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {currentItem.prompt}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <span className="text-green-600 text-2xl mb-2 block">✓</span>
                  <span className="text-sm text-gray-700">Platform-optimized dimensions</span>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <span className="text-green-600 text-2xl mb-2 block">✓</span>
                  <span className="text-sm text-gray-700">Enhanced visual appeal</span>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <span className="text-green-600 text-2xl mb-2 block">✓</span>
                  <span className="text-sm text-gray-700">Trending aesthetic elements</span>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <span className="text-green-600 text-2xl mb-2 block">✓</span>
                  <span className="text-sm text-gray-700">Optimized for engagement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex gap-2">
              {comparisons.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedIndex ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Content?
            </h3>
            <p className="text-gray-600 mb-6">
              Upload any image and let AI create stunning {platform} covers in seconds
            </p>
            <Link href="#generator">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try It Now - It's Free!
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}