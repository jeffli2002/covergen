'use client'

import { useState } from 'react'
import { Mic, Radio, Headphones, Palette, Download, Zap, TrendingUp, Music } from 'lucide-react'
import GenerationForm from '@/components/generation-form'
import { Button } from '@/components/ui/button'

interface Props {
  locale: string
  translations: any
}

export default function PodcastCoverMakerClient({ locale, translations }: Props) {
  const [selectedGenre, setSelectedGenre] = useState('business')

  const podcastGenres = [
    { id: 'business', name: 'Business', icon: <TrendingUp className="w-5 h-5" />, style: 'Professional, clean, corporate colors' },
    { id: 'true-crime', name: 'True Crime', icon: <Radio className="w-5 h-5" />, style: 'Dark, mysterious, noir aesthetics' },
    { id: 'comedy', name: 'Comedy', icon: <Mic className="w-5 h-5" />, style: 'Bright, fun, playful designs' },
    { id: 'education', name: 'Education', icon: <Headphones className="w-5 h-5" />, style: 'Academic, trustworthy, informative' },
    { id: 'wellness', name: 'Health & Wellness', icon: <Music className="w-5 h-5" />, style: 'Calming, natural, peaceful colors' },
    { id: 'tech', name: 'Technology', icon: <Zap className="w-5 h-5" />, style: 'Modern, futuristic, digital elements' },
  ]

  const features = [
    {
      title: 'Perfect 3000x3000 Size',
      description: 'Meets Apple Podcasts and Spotify requirements',
      icon: <Radio className="w-6 h-6" />,
    },
    {
      title: 'Platform Compliance',
      description: 'Follows all major platform guidelines automatically',
      icon: <Headphones className="w-6 h-6" />,
    },
    {
      title: 'Genre-Specific Styles',
      description: 'AI understands podcast genres and audience expectations',
      icon: <Palette className="w-6 h-6" />,
    },
    {
      title: 'High Resolution Export',
      description: 'Crystal clear quality at required specifications',
      icon: <Download className="w-6 h-6" />,
    },
  ]

  const platformSpecs = [
    { platform: 'Apple Podcasts', size: '3000x3000', format: 'JPG/PNG', maxSize: '512KB' },
    { platform: 'Spotify', size: '3000x3000', format: 'JPG/PNG', maxSize: '10MB' },
    { platform: 'Google Podcasts', size: '3000x3000', format: 'JPG/PNG', maxSize: '10MB' },
    { platform: 'Stitcher', size: '3000x3000', format: 'JPG/PNG', maxSize: '10MB' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold mb-6">
              Podcast Cover Maker
            </h1>
            <p className="text-xl mb-8 text-purple-100">
              Create professional podcast covers that attract listeners. AI-generated artwork 
              that meets all platform requirements.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Mic className="w-4 h-4" />
                <span>KD: 23 (Low Competition)</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Radio className="w-4 h-4" />
                <span>Growing 133% YoY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Tool Section */}
            <div id="tool" className="bg-white rounded-2xl shadow-xl p-8 mb-16">
              <h2 className="text-2xl font-bold mb-6">Design Your Podcast Cover</h2>
              
              {/* Genre Selector */}
              <div className="mb-8">
                <label className="block text-sm font-medium mb-3">Select Your Podcast Genre</label>
                <div className="grid md:grid-cols-3 gap-4">
                  {podcastGenres.slice(0, 6).map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => setSelectedGenre(genre.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedGenre === genre.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                          {genre.icon}
                        </div>
                        <h3 className="font-semibold">{genre.name}</h3>
                      </div>
                      <p className="text-xs text-gray-600 text-left">{genre.style}</p>
                    </button>
                  ))}
                </div>
              </div>

              <GenerationForm 
                mode="podcast-cover"
                platform="podcast"
                aspectRatio="3000x3000"
                translations={translations}
              />
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Platform Specifications */}
            <div className="bg-gray-50 rounded-2xl p-12 mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">
                Platform Requirements Met Automatically
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Platform</th>
                      <th className="px-6 py-4 text-left">Size</th>
                      <th className="px-6 py-4 text-left">Format</th>
                      <th className="px-6 py-4 text-left">Max File Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformSpecs.map((spec, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="px-6 py-4 font-medium">{spec.platform}</td>
                        <td className="px-6 py-4">{spec.size}</td>
                        <td className="px-6 py-4">{spec.format}</td>
                        <td className="px-6 py-4">{spec.maxSize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <p className="text-center mt-6 text-gray-600">
                Our AI automatically optimizes your cover to meet all platform specifications
              </p>
            </div>

            {/* Best Practices */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-12 mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">
                Podcast Cover Best Practices
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-8">
                  <h3 className="text-xl font-semibold mb-4 text-purple-600">Design Tips</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Use bold, readable text - covers appear small on devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Include your podcast name prominently</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Avoid too much detail - simplicity wins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Use consistent branding across episodes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Test visibility at thumbnail size</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-xl p-8">
                  <h3 className="text-xl font-semibold mb-4 text-pink-600">Technical Requirements</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 mt-1">✓</span>
                      <span>Minimum 1400x1400, recommended 3000x3000</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 mt-1">✓</span>
                      <span>RGB color mode (not CMYK)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 mt-1">✓</span>
                      <span>72 DPI resolution minimum</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 mt-1">✓</span>
                      <span>Square format (1:1 ratio)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 mt-1">✓</span>
                      <span>No explicit content or misleading imagery</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Success Stories */}
            <div className="bg-gray-900 text-white rounded-2xl p-12 mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why Professional Podcast Covers Matter
              </h2>
              
              <div className="max-w-3xl mx-auto space-y-6 text-gray-300">
                <p>
                  Your podcast cover is often the first impression potential listeners get. Studies show that 
                  podcasts with professional covers get <span className="text-purple-400 font-semibold">47% more downloads</span> in 
                  their first month compared to those with amateur designs.
                </p>
                
                <p>
                  Apple Podcasts and Spotify both use visual appeal as a ranking factor. A well-designed cover 
                  can improve your <span className="text-pink-400 font-semibold">discoverability by up to 30%</span>.
                </p>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-8">
                  <h3 className="text-xl font-semibold mb-4">Platform Algorithm Tips</h3>
                  <ul className="space-y-2">
                    <li>• High contrast covers perform better in search results</li>
                    <li>• Clear, readable text improves click-through rates</li>
                    <li>• Consistent branding builds listener trust</li>
                    <li>• Genre-appropriate design attracts target audience</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">What size should my podcast cover be?</h3>
                  <p className="text-gray-600">
                    The recommended size is 3000x3000 pixels. This meets all platform requirements and ensures 
                    your cover looks crisp on all devices. Our tool automatically creates this size.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Can I use the same cover for all platforms?</h3>
                  <p className="text-gray-600">
                    Yes! A 3000x3000 JPG or PNG works for Apple Podcasts, Spotify, Google Podcasts, and all 
                    other major platforms. We ensure your cover meets all specifications.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">How often should I update my podcast cover?</h3>
                  <p className="text-gray-600">
                    Your main podcast cover should stay consistent for branding. However, you can create 
                    special covers for seasons, series, or special episodes.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">What makes a good podcast cover?</h3>
                  <p className="text-gray-600">
                    Clear, readable text (especially the podcast name), simple but eye-catching design, 
                    appropriate colors for your genre, and professional quality that builds trust.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Launch Your Podcast with Style?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Create a professional podcast cover that attracts listeners and meets all platform requirements.
          </p>
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
            <Mic className="w-5 h-5 mr-2" />
            Create Podcast Cover
          </Button>
        </div>
      </section>
    </div>
  )
}