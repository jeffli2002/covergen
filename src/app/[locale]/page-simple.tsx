'use client'

import { useEffect, useState } from 'react'
import { Locale } from '@/lib/i18n/config'

interface SimpleHomePageProps {
  locale: Locale
  translations: any
}

export default function SimpleHomePage({ locale, translations }: SimpleHomePageProps) {
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    console.log('[SimpleHomePage] Starting render with:', { locale, hasTranslations: !!translations })
    setIsReady(true)
  }, [locale, translations])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight mb-6 md:mb-8 text-gray-900 leading-tight">
              Create Stunning Covers with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">AI Magic</span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-4 max-w-4xl mx-auto px-4 font-medium leading-relaxed">
              Generate professional covers and posters for your content across all platforms.
            </p>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl px-6 py-4 mb-8 max-w-3xl mx-auto border border-green-200">
              <p className="text-lg md:text-xl font-semibold text-green-800">
                🎉 <span className="underline decoration-2 decoration-green-400">TRY FREE TODAY</span> • No Sign-in Required • Unlimited Creativity
              </p>
            </div>

            <button 
              className="text-xl md:text-2xl px-12 py-8 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
              onClick={() => {
                document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Start Free - No Login Required
            </button>
          </div>
        </div>
      </section>

      {/* Simple Generator Section */}
      <section id="generator" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
                AI Cover Generator
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Upload an image and describe what you want to create. Our AI will generate amazing covers for you.
              </p>
              
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 mb-6">
                  <p className="text-gray-500 mb-4">Drag and drop an image here, or click to select</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="image-upload"
                  />
                  <label 
                    htmlFor="image-upload"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Choose Image
                  </label>
                </div>
                
                <div className="mb-6">
                  <textarea 
                    placeholder="Describe what you want to create (e.g., 'A modern tech cover for a mobile app')"
                    className="w-full p-4 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                  ></textarea>
                </div>
                
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                  Generate Cover
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">Why Choose CoverGen Pro?</h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
              Built for content creators who want <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">professional results</span> without the complexity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            <div className="text-center hover:scale-105 transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-lg bg-white group hover:-translate-y-2 rounded-3xl p-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-3xl bg-gradient-to-br from-orange-100 to-red-100 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-8 h-8 text-orange-600">✨</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">AI-Powered</h3>
              <p className="text-base text-gray-600 leading-relaxed">Advanced AI creates stunning, professional covers in seconds</p>
            </div>

            <div className="text-center hover:scale-105 transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-lg bg-white group hover:-translate-y-2 rounded-3xl p-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-8 h-8 text-blue-600">⚡</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Lightning Fast</h3>
              <p className="text-base text-gray-600 leading-relaxed">Generate multiple variations instantly with one click</p>
            </div>

            <div className="text-center hover:scale-105 transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-lg bg-white group hover:-translate-y-2 rounded-3xl p-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-8 h-8 text-green-600">🌐</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Multi-Platform</h3>
              <p className="text-base text-gray-600 leading-relaxed">Perfectly sized for YouTube, TikTok, Spotify, and more</p>
            </div>

            <div className="text-center hover:scale-105 transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-lg bg-white group hover:-translate-y-2 rounded-3xl p-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-8 h-8 text-purple-600">🛡️</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Brand Consistent</h3>
              <p className="text-base text-gray-600 leading-relaxed">Maintain your unique style across all platforms</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
