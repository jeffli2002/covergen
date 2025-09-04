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
  const [showOriginal, setShowOriginal] = useState(true)
  const currentItem = comparisons[selectedIndex]

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % comparisons.length)
    setShowOriginal(true)
  }

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + comparisons.length) % comparisons.length)
    setShowOriginal(true)
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
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Image Display */}
            <div className="relative">
              <Card className="overflow-hidden">
                <div className={`relative ${
                  aspectRatio === 'vertical' ? 'aspect-[9/16]' : 
                  aspectRatio === 'square' ? 'aspect-square' : 
                  'aspect-video'
                }`}>
                  <img
                    src={showOriginal ? currentItem.original.src : currentItem.aiGenerated.src}
                    alt={showOriginal ? currentItem.original.alt : currentItem.aiGenerated.alt}
                    className={`w-full h-full object-cover ${
                      !showOriginal ? 'brightness-110 contrast-125 saturate-150' : ''
                    }`}
                  />
                  {/* Label */}
                  <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-semibold ${
                    showOriginal 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  }`}>
                    {showOriginal ? (
                      <>
                        <Camera className="w-4 h-4 inline mr-2" />
                        Original Photo
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 inline mr-2" />
                        AI Generated
                      </>
                    )}
                  </div>
                </div>
              </Card>

              {/* Toggle Button */}
              <div className="flex justify-center mt-6 gap-4">
                <Button
                  variant={showOriginal ? "default" : "outline"}
                  onClick={() => setShowOriginal(true)}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Original
                </Button>
                <Button
                  variant={!showOriginal ? "default" : "outline"}
                  onClick={() => setShowOriginal(false)}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Generated
                </Button>
              </div>
            </div>

            {/* Details Panel */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{currentItem.title}</h3>
                <p className="text-gray-600 mb-4">Style: {currentItem.style}</p>
              </div>

              <div className="bg-gray-100 rounded-xl p-6">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                  AI Generation Prompt
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {currentItem.prompt}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Key Transformations:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">Platform-optimized dimensions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">Enhanced visual appeal for {platform}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">Trending aesthetic elements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">Optimized for engagement</span>
                  </li>
                </ul>
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