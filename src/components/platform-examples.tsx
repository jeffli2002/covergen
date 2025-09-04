'use client'

import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { LazyImage } from '@/components/seo/LazyImage'

interface PlatformExamplesProps {
  platform: string
  examples: {
    src: string
    alt: string
    title: string
    webpSrc?: string
  }[]
  aspectRatio?: 'video' | 'square' | 'vertical'
}

export default function PlatformExamples({ platform, examples, aspectRatio = 'video' }: PlatformExamplesProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'vertical':
        return 'aspect-[9/16]'
      case 'square':
        return 'aspect-square'
      default:
        return 'aspect-video'
    }
  }
  
  const getDimensions = () => {
    switch (aspectRatio) {
      case 'vertical':
        return { width: 540, height: 960 }
      case 'square':
        return { width: 600, height: 600 }
      default:
        return { width: 800, height: 450 }
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Example Covers Created with CoverGen Pro
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            See what's possible with our AI-powered cover generation
          </p>
          
          <div className={`grid gap-6 ${
            aspectRatio === 'vertical' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {examples.map((example, index) => (
              <Card 
                key={index} 
                className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedImage(index)}
              >
                <div className={`relative ${getAspectRatioClass()}`}>
                  <LazyImage
                    src={example.webpSrc || example.src}
                    alt={example.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 3}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-semibold text-lg">
                        {example.title}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-2">
              All covers are AI-generated and optimized for {platform}
            </p>
            <p className="text-sm text-gray-500">
              Create unlimited variations with our Pro plans
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox for selected image */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <LazyImage
              src={examples[selectedImage].webpSrc || examples[selectedImage].src}
              alt={examples[selectedImage].alt}
              width={1200}
              height={675}
              className="w-full h-auto rounded-lg"
              sizes="100vw"
              priority
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(null)
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}