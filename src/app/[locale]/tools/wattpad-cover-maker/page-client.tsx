'use client'

import React, { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Locale } from '@/lib/i18n/config'
// import { Dictionary } from '@/lib/i18n/types'
import { ArrowDown } from 'lucide-react'
import WattpadCoverTool from '@/components/tools/WattpadCoverTool'
import Image from 'next/image'

interface WattpadCoverMakerClientProps {
  locale: Locale
  translations: any
}

export default function WattpadCoverMakerClient({ locale, translations }: WattpadCoverMakerClientProps) {
  const t = translations?.tools?.wattpadCover || {
    hero: {
      title: 'Wattpad Cover Maker',
      subtitle: 'Design captivating story covers',
      description: 'Create stunning Wattpad covers that attract readers. Perfect 512x800 dimensions for maximum impact.',
      cta: 'Create Your Cover',
      trustText: 'Join thousands of Wattpad authors creating professional covers',
    },
    features: {
      genres: 'All Story Genres',
      customization: 'Genre-Specific Designs',
      fastGeneration: 'Instant Generation'
    }
  }

  // Smooth scroll to generator section
  const scrollToGenerator = useCallback(() => {
    const generatorSection = document.getElementById('generator-section')
    if (generatorSection) {
      generatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const faqs = [
    {
      question: 'What are the standard dimensions for Wattpad covers?',
      answer: 'The recommended dimensions for Wattpad covers are 512x800 pixels. Our tool automatically generates covers in this size to ensure they display perfectly across all devices.'
    },
    {
      question: 'Can I create covers for different story genres?',
      answer: 'Yes! Our tool supports all Wattpad genres including Romance, Fantasy, Sci-Fi, Fanfiction, Teen Fiction, and more. Each genre has tailored design styles to match your story.'
    },
    {
      question: 'Are the generated covers compliant with Wattpad content policies?',
      answer: 'Yes, our AI system ensures all generated covers comply with Wattpad\'s content guidelines and are appropriate for all age groups on the platform.'
    },
    {
      question: 'Can I add my own character images?',
      answer: 'Absolutely! You can upload your own character images or use our AI to generate unique character designs for fully customized story covers.'
    },
    {
      question: 'How can I make my cover more appealing to readers?',
      answer: 'Use eye-catching titles, choose colors that match your story mood, and include compelling character imagery. Our AI automatically optimizes these elements based on your chosen genre.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Content */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t.hero?.title || 'Wattpad Cover Maker'}
          </h1>
          
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            {t.hero?.subtitle || 'Design captivating story covers'}
          </p>
          
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            {t.hero?.description || 'Create stunning Wattpad covers that attract readers. Perfect 512x800 dimensions for maximum impact.'}
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                20+
              </div>
              <div className="text-sm text-gray-600">
                {t.features?.genres || 'Story Genres'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                100%
              </div>
              <div className="text-sm text-gray-600">
                {t.features?.customization || 'Customizable'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                30s
              </div>
              <div className="text-sm text-gray-600">
                {t.features?.fastGeneration || 'Fast Generation'}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              onClick={scrollToGenerator}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {t.hero?.cta || 'Create Your Cover'}
              <ArrowDown className="ml-2 h-5 w-5" />
            </Button>
            
            {/* Trust Text */}
            <p className="text-sm text-gray-500">
              {t.hero?.trustText || 'Join thousands of Wattpad authors creating professional covers'}
            </p>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section id="generator-section" className="py-12 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <WattpadCoverTool />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Choose Our Wattpad Cover Maker
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Genre-Optimized
              </h3>
              <p className="text-gray-600">
                Designed for every story type, from Romance to Sci-Fi, each cover perfectly matches your narrative style
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Get professionally designed covers in under 30 seconds, letting you focus on writing, not designing
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Reader Magnet
              </h3>
              <p className="text-gray-600">
                Optimized designs that stand out in Wattpad browsing feeds and attract more readers to your stories
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <article className="prose prose-lg mx-auto">
          <h2>Creating Compelling Wattpad Story Covers</h2>
          
          <p>
            On Wattpad, where millions of stories compete for attention, an eye-catching cover is crucial for standing out. Our AI-powered Wattpad cover maker is designed specifically for storytellers, helping you create professional, engaging covers that perfectly represent your narrative.
          </p>

          <h3>Supporting All Wattpad Genres</h3>
          <p>
            Whether you're writing romance, fantasy epics, sci-fi adventures, or coming-of-age tales, our tool provides genre-specific design elements. From mysterious dark atmospheres to bright romantic tones, each cover is crafted to appeal to your target readers.
          </p>

          <h3>Perfect Wattpad Cover Dimensions</h3>
          <p>
            Our cover maker automatically generates images at 512x800 pixels—the official Wattpad recommended size. This ensures your cover displays crisp and clear across mobile phones, tablets, and desktop devices without any cropping or distortion issues.
          </p>

          <h3>AI-Enhanced Creative Process</h3>
          <p>
            Using advanced AI technology, our tool understands your story elements and generates unique visual concepts. Simply input your story title, select your genre, and describe key elements—the AI will create multiple design options for you to choose from.
          </p>

          <h3>Boost Your Wattpad Presence</h3>
          <p>
            A professional cover not only attracts new readers but also establishes your credibility as a serious author. Studies show that stories with high-quality covers receive significantly more reads and votes. Give your story the attention it deserves.
          </p>
        </article>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}