'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronRight, Sparkles, Clock, Wand2 } from 'lucide-react'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define the showcase data structure
interface ShowcaseItem {
  id: string
  platform: string
  prompt: string
  processingTime: string
  original: string
  enhanced: string
  color: string // Platform-specific accent color
}

const showcaseData: ShowcaseItem[] = [
  {
    id: 'instagram',
    platform: 'Instagram',
    prompt: "Transform this lifestyle photo into a vibrant Instagram post with modern typography and trendy aesthetics",
    processingTime: "8 seconds",
    original: '/platform-examples/instagram/original-1.jpg',
    enhanced: '/platform-examples/instagram/enhancedImage1.png',
    color: 'from-pink-500 to-purple-600'
  },
  {
    id: 'rednote',
    platform: 'RedNote',
    prompt: "Create an eye-catching cover with Chinese design elements, bold colors, and social media appeal",
    processingTime: "10 seconds",
    original: '/platform-examples/rednote/original1.jpg',
    enhanced: '/platform-examples/rednote/enhancedImage1.png',
    color: 'from-red-500 to-orange-600'
  },
  {
    id: 'spotify',
    platform: 'Spotify',
    prompt: "Design a professional music playlist cover with atmospheric mood and Spotify's signature style",
    processingTime: "12 seconds",
    original: '/platform-examples/spotify/original-1.jpg',
    enhanced: '/platform-examples/spotify/imageEnhanced1.png',
    color: 'from-green-500 to-emerald-600'
  }
]

export default function AIShowcase() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observers = showcaseData.map((_, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleItems((prev) => new Set(prev).add(index))
            }
          })
        },
        { threshold: 0.2, rootMargin: '-100px' }
      )
      return observer
    })

    // Observe each showcase item
    const items = containerRef.current?.querySelectorAll('.showcase-item')
    items?.forEach((item, index) => {
      if (observers[index]) {
        observers[index].observe(item)
      }
    })

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [])

  return (
    <section className="py-24 md:py-32 bg-white overflow-hidden" ref={containerRef}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={cn(
          "text-center mb-16 md:mb-24 transition-all duration-700 delay-100",
          visibleItems.size > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">AI-Powered Enhancement</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
            See the Magic in Action
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
            Watch how our AI transforms ordinary images into stunning, 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> platform-optimized covers</span> in seconds
          </p>
        </div>

        {/* Showcase Items */}
        <div className="space-y-20 md:space-y-32 max-w-7xl mx-auto">
          {showcaseData.map((item, index) => (
            <ShowcaseItem 
              key={item.id}
              item={item}
              index={index}
              isActive={activeIndex === index}
              isHovered={hoveredIndex === index}
              isVisible={visibleItems.has(index)}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

interface ShowcaseItemProps {
  item: ShowcaseItem
  index: number
  isActive: boolean
  isHovered: boolean
  isVisible: boolean
  onHover: () => void
  onLeave: () => void
  onClick: () => void
}

function ShowcaseItem({ item, index, isActive, isHovered, isVisible, onHover, onLeave, onClick }: ShowcaseItemProps) {
  const [imageLoaded, setImageLoaded] = useState({ original: false, enhanced: false })
  const [showComparison, setShowComparison] = useState(false)

  return (
    <div 
      className={cn(
        "showcase-item relative transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Platform Header */}
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg",
            item.color
          )}>
            {item.platform[0]}
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{item.platform}</h3>
            <p className="text-sm md:text-base text-gray-600 mt-1">Platform-optimized design</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{item.processingTime}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 xl:gap-12 items-center">
          {/* Original Image Side */}
          <div 
            className="relative flex flex-col items-center justify-center"
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
          >
            {/* Content Wrapper */}
            <div className="w-full">
              {/* Prompt Card */}
              <div className={cn(
                "relative z-10 transition-all duration-500 mb-4",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              )}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-lg border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex-shrink-0">
                      <Wand2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">AI Prompt</p>
                      <p className="text-sm md:text-base text-gray-800 leading-relaxed">{item.prompt}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Original Image */}
              <div className={cn(
                "relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-700",
                isHovered ? "scale-[0.98]" : ""
              )}>
              <div className="relative">
                <Image
                  src={item.original}
                  alt={`Original ${item.platform} image`}
                  width={800}
                  height={800}
                  className="w-full h-auto object-contain"
                  onLoad={() => setImageLoaded(prev => ({ ...prev, original: true }))}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {!imageLoaded.original && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                )}
              </div>
              
              {/* Original Label */}
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                <span className="text-sm font-medium text-gray-700">Original</span>
              </div>
            </div>
            </div>
          </div>

          {/* Arrow/VS Indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div
              className={cn(
                "w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer",
                isHovered ? "scale-110" : ""
              )}
              onClick={onClick}
            >
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>

          {/* Enhanced Image Side */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Enhanced Image */}
            <div className={cn(
              "relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-700",
              isHovered ? "scale-[0.98]" : "",
              isActive ? "ring-4 ring-blue-500/30" : ""
            )}>
              <div className="relative">
                <Image
                  src={item.enhanced}
                  alt={`Enhanced ${item.platform} cover`}
                  width={800}
                  height={800}
                  className="w-full h-auto object-contain"
                  onLoad={() => setImageLoaded(prev => ({ ...prev, enhanced: true }))}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {!imageLoaded.enhanced && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                )}
              </div>
              
              {/* Enhanced Label with Sparkle */}
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI Enhanced</span>
              </div>
              
              {/* Platform Badge */}
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white rounded-full">
                <span className="text-xs font-medium">{item.platform} Ready</span>
              </div>
            </div>

            {/* Enhancement Details (shown on active) */}
            <div className={cn(
              "mt-6 space-y-4 transition-all duration-300",
              isActive ? "opacity-100 max-h-96" : "opacity-0 max-h-0 overflow-hidden"
            )}>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-3">AI Enhancements Applied:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    Platform-specific dimensions and layout
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    Professional typography and branding
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-600" />
                    Color grading and visual optimization
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full"
          >
            {/* Mobile Comparison Slider */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative">
                {/* Original Image (Mobile) */}
                <div
                  className={cn(
                    "transition-opacity duration-500",
                    showComparison ? "opacity-0 absolute inset-0" : "opacity-100"
                  )}
                >
                  <Image
                    src={item.original}
                    alt={`Original ${item.platform} image`}
                    width={800}
                    height={800}
                    className="w-full h-auto object-contain"
                    sizes="100vw"
                  />
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                    <span className="text-sm font-medium text-gray-700">Original</span>
                  </div>
                </div>

                {/* Enhanced Image (Mobile) */}
                <div
                  className={cn(
                    "transition-opacity duration-500",
                    showComparison ? "opacity-100" : "opacity-0 absolute inset-0"
                  )}
                >
                  <Image
                    src={item.enhanced}
                    alt={`Enhanced ${item.platform} cover`}
                    width={800}
                    height={800}
                    className="w-full h-auto object-contain"
                    sizes="100vw"
                  />
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">AI Enhanced</span>
                  </div>
                </div>

                {/* Toggle Indicator */}
                <div className="absolute top-4 right-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-300",
                    showComparison ? "rotate-180" : ""
                  )}>
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Mobile Prompt Display */}
          <div className="mt-6 bg-gray-50 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex-shrink-0">
                <Wand2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-1">AI Prompt</p>
                <p className="text-sm text-gray-800 leading-relaxed">{item.prompt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}