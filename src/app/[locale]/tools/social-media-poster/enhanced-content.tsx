'use client'

import Image from 'next/image'
import { Check, Sparkles, Zap, Users, Grid3X3, Share2, Palette, Clock } from 'lucide-react'

interface Props {
  locale: string
}

export default function SocialMediaPosterContent({ locale }: Props) {

  const features = [
    {
      icon: <Grid3X3 className="w-6 h-6" />,
      title: 'Instagram Grid Maker',
      description: 'Create cohesive Instagram grid layouts that tell your brand story',
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Pinterest Pin Maker',
      description: 'Design pins that get saved and shared with optimized dimensions',
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: 'Multi-Platform Export',
      description: 'One design, all platforms - auto-resize for every social network',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-Powered Suggestions',
      description: 'Get trending design ideas based on your content and audience',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Discord Banner Maker',
      description: 'Create custom Discord server banners that stand out',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Twitter Header Maker',
      description: 'Design eye-catching Twitter/X headers that convert',
    },
  ]

  const platforms = [
    { name: 'Instagram', formats: ['Post (1080x1080)', 'Story (1080x1920)', 'Reel Cover (1080x1920)', 'Grid (3240x1080)'] },
    { name: 'Facebook', formats: ['Post (1200x630)', 'Cover (820x312)', 'Event Cover (1920x1080)'] },
    { name: 'LinkedIn', formats: ['Post (1200x627)', 'Banner (1584x396)', 'Article (1200x627)'] },
    { name: 'Twitter/X', formats: ['Post (1200x675)', 'Header (1500x500)'] },
    { name: 'Pinterest', formats: ['Pin (1000x1500)', 'Story Pin (1080x1920)', 'Idea Pin (1080x1920)'] },
    { name: 'Discord', formats: ['Server Banner (960x540)', 'Invite Banner (1920x1080)'] },
  ]

  const useCases = [
    {
      title: 'Content Creators',
      description: 'Build a consistent visual brand across all social platforms',
      image: '/use-cases/content-creator-social.jpg',
    },
    {
      title: 'Small Businesses',
      description: 'Create professional marketing materials without a design team',
      image: '/use-cases/business-social.jpg',
    },
    {
      title: 'Influencers',
      description: 'Stand out with unique, on-brand social media content',
      image: '/use-cases/influencer-social.jpg',
    },
    {
      title: 'Community Managers',
      description: 'Quickly create engaging posts for multiple accounts',
      image: '/use-cases/community-social.jpg',
    },
  ]

  return (
    <div className="py-16 space-y-24">
      {/* Features Section */}
      <section id="features" className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">All-In-One Social Media Design Tool</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From Instagram grid maker to Discord banner maker, create stunning visuals for every platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Dimensions */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Optimized for Every Social Platform
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <div key={platform.name} className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-purple-600">{platform.name}</h3>
                <ul className="space-y-2">
                  {platform.formats.map((format) => (
                    <li key={format} className="flex items-center gap-2 text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{format}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Who Uses Our Social Media Poster Maker?</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="text-center">
              <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
              <p className="text-gray-600">{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Social Media Poster Maker?
          </h2>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-purple-600 mb-6">CoverGen Pro Advantages</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Free Instagram Grid Maker</h4>
                      <p className="text-gray-600">Create stunning grid layouts with no watermarks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">AI-Powered Design</h4>
                      <p className="text-gray-600">Smart Pinterest pin maker with trending suggestions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Multi-Platform Export</h4>
                      <p className="text-gray-600">One-click resize for all social networks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Platform-Specific Tools</h4>
                      <p className="text-gray-600">Discord banner maker with gaming themes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">No Signup Required</h4>
                      <p className="text-gray-600">Start creating immediately with basic features</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-400 mb-6">Other Tools Limitations</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 opacity-75">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl text-gray-400">×</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-600">Watermarked Designs</h4>
                      <p className="text-gray-500">Free versions include watermarks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 opacity-75">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl text-gray-400">×</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-600">Limited Features</h4>
                      <p className="text-gray-500">Basic templates without platform optimization</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 opacity-75">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl text-gray-400">×</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-600">Manual Resizing</h4>
                      <p className="text-gray-500">Resize designs manually for each platform</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 opacity-75">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl text-gray-400">×</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-600">Generic Templates</h4>
                      <p className="text-gray-500">One-size-fits-all approach</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 opacity-75">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl text-gray-400">×</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-600">Signup Walls</h4>
                      <p className="text-gray-500">Account required for basic features</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Create Viral Social Media Posts in 3 Steps
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Choose Your Platform</h3>
                <p className="text-gray-600">
                  Select from Instagram, Facebook, LinkedIn, Twitter, Discord, Pinterest, or create for multiple platforms at once.
                  Our Instagram grid maker and Pinterest pin maker features help you create platform-specific designs.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Customize Your Design</h3>
                <p className="text-gray-600">
                  Use our AI-powered design suggestions or choose from trending templates. Add text, images, and brand elements.
                  Perfect for creating Twitter headers, Discord banners, or cohesive Instagram grids.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Export and Share</h3>
                <p className="text-gray-600">
                  Download your designs in perfect quality for each platform. Auto-resize for multiple platforms with one click.
                  No watermarks, ready to post immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Start Creating Viral Social Media Content Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of creators using our free Instagram grid maker, Pinterest pin maker, and more
          </p>
          <a
            href="#tool"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            Create Your First Post Free
          </a>
        </div>
      </section>
    </div>
  )
}