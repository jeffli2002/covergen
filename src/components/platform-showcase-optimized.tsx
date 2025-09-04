'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Sparkles, Camera, Maximize2 } from 'lucide-react'
import Link from 'next/link'

interface ShowcaseItem {
  title: string
  originalImage: string
  optimizedImage?: string // WebP version
  targetDimensions: { width: number; height: number; label: string }
}

interface PlatformShowcaseProps {
  platform: string
  showcases: ShowcaseItem[]
  primaryColor?: string
}

export default function PlatformShowcaseOptimized({ 
  platform, 
  showcases,
  primaryColor = 'purple'
}: PlatformShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showTransformed, setShowTransformed] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({})
  const current = showcases[currentIndex]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + showcases.length) % showcases.length)
    setShowTransformed(false)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % showcases.length)
    setShowTransformed(false)
  }

  const handleImageLoad = (imagePath: string) => {
    setImagesLoaded(prev => ({ ...prev, [imagePath]: true }))
  }

  // Simulated title styles for different platforms
  const getTitleStyle = () => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return 'text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]'
      case 'tiktok':
        return 'text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] text-center leading-tight'
      case 'instagram':
        return 'text-2xl md:text-3xl font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]'
      default:
        return 'text-3xl font-bold text-white drop-shadow-lg'
    }
  }

  const getAspectRatio = () => {
    const { width, height } = current.targetDimensions
    if (width === 1280 && height === 720) return 'aspect-[16/9]'
    if (width === 1080 && height === 1920) return 'aspect-[9/16] max-w-sm' // Smaller for TikTok vertical
    if (width === 1080 && height === 1080) return 'aspect-square'
    return 'aspect-video'
  }

  // Get optimized image path
  const getImageSrc = (item: ShowcaseItem) => {
    return item.optimizedImage || item.originalImage
  }

  // Preload next image for smoother transitions
  const preloadNextImage = () => {
    const nextIndex = (currentIndex + 1) % showcases.length
    const nextImage = showcases[nextIndex]
    if (nextImage && typeof window !== 'undefined') {
      const img = new window.Image()
      img.src = getImageSrc(nextImage)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI Transforms Any Photo into {platform} Content
            </h2>
            <p className="text-lg text-gray-600">
              Upload your photo → AI resizes to {current.targetDimensions.label} → Adds engaging titles & effects
            </p>
          </div>

          {/* Main Showcase */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {/* Platform Dimensions Badge */}
            <div className="flex justify-center mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                primaryColor === 'red' ? 'bg-red-100 text-red-700' :
                primaryColor === 'pink' ? 'bg-pink-100 text-pink-700' :
                primaryColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                primaryColor === 'green' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              } font-medium`}>
                <Maximize2 className="w-4 h-4 mr-2" />
                {platform} Size: {current.targetDimensions.label}
              </div>
            </div>

            {/* Image Container */}
            <div className="relative">
              <div className={`relative mx-auto ${getAspectRatio()} max-w-3xl bg-gray-100 rounded-xl overflow-hidden`}>
                {!showTransformed ? (
                  // Original Image (centered and cropped to platform size)
                  <div className="relative w-full h-full">
                    <Image
                      src={getImageSrc(current)}
                      alt={`Original photo for ${platform} - ${current.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                      className="object-cover"
                      priority={currentIndex === 0}
                      quality={85}
                      onLoad={() => handleImageLoad(current.originalImage)}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    {!imagesLoaded[current.originalImage] && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute top-4 left-4 flex items-center px-3 py-1.5 bg-gray-900 text-white rounded-full text-sm font-medium">
                      <Camera className="w-4 h-4 mr-2" />
                      Original Photo (Resized)
                    </div>
                  </div>
                ) : (
                  // AI Enhanced Version with Title
                  <div className="relative w-full h-full">
                    <Image
                      src={getImageSrc(current)}
                      alt={`AI enhanced ${platform} content - ${current.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                      className="object-cover brightness-110 contrast-125 saturate-150"
                      quality={85}
                      onLoad={() => {
                        handleImageLoad(current.originalImage)
                        preloadNextImage()
                      }}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    {!imagesLoaded[current.originalImage] && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* AI-generated title overlay */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <h3 className={getTitleStyle()}>
                        {current.title}
                      </h3>
                    </div>

                    {/* Platform-specific decorations */}
                    {platform === 'YouTube' && (
                      <div className="absolute bottom-4 right-4 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
                        10:23
                      </div>
                    )}

                    <div className="absolute top-4 left-4 flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Enhanced
                    </div>
                  </div>
                )}
              </div>

              {/* Transformation Toggle */}
              <div className="flex justify-center mt-8 gap-4">
                <Button
                  size="lg"
                  variant={!showTransformed ? "default" : "outline"}
                  onClick={() => setShowTransformed(false)}
                  className="min-w-[140px]"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Original
                </Button>
                <Button
                  size="lg"
                  variant={showTransformed ? "default" : "outline"}
                  onClick={() => setShowTransformed(true)}
                  className="min-w-[140px]"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI Enhanced
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="rounded-full"
                aria-label="Previous example"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex gap-2">
                {showcases.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index)
                      setShowTransformed(false)
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex 
                        ? (primaryColor === 'red' ? 'bg-red-600' :
                           primaryColor === 'pink' ? 'bg-pink-600' :
                           primaryColor === 'purple' ? 'bg-purple-600' :
                           primaryColor === 'green' ? 'bg-green-600' :
                           'bg-blue-600')
                        : 'bg-gray-300'
                    }`}
                    aria-label={`Go to example ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="rounded-full"
                aria-label="Next example"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Example Counter */}
            <p className="text-center text-sm text-gray-500 mt-4">
              Example {currentIndex + 1} of {showcases.length}
            </p>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold mb-4">
              Transform Your Photos into {platform} Content
            </h3>
            <p className="text-gray-600 mb-6">
              AI automatically resizes, enhances, and adds engaging titles
            </p>
            <Link href="/#generator">
              <Button 
                size="lg" 
                className={`bg-gradient-to-r ${
                  primaryColor === 'red' ? 'from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700' :
                  primaryColor === 'pink' ? 'from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700' :
                  primaryColor === 'purple' ? 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' :
                  primaryColor === 'green' ? 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' :
                  'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                } text-white`}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try It Free Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}