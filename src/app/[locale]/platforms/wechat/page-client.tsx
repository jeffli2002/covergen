'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, Users, Globe, Smartphone, QrCode, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: 'China-Ready',
    description: 'Designs optimized for Chinese audience preferences'
  },
  {
    icon: Users,
    title: 'Engagement Focus',
    description: 'Boost shares and likes in WeChat ecosystem'
  },
  {
    icon: QrCode,
    title: 'QR Code Ready',
    description: 'Smart layouts that accommodate QR codes'
  },
  {
    icon: MessageCircle,
    title: 'Multi-Format',
    description: 'Perfect for Moments, articles, and mini-programs'
  }
]

export default function WeChatCoverMakerClient({ locale, translations }: { locale: string, translations: any }) {
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create Professional WeChat Covers',
    description: 'Step-by-step guide to creating WeChat Moments and official account covers with AI',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Choose cover type',
        text: 'Select from Moments cover, article header, or mini-program banner'
      },
      {
        '@type': 'HowToStep',
        name: 'Upload brand elements',
        text: 'Add your logo, brand colors, or QR code'
      },
      {
        '@type': 'HowToStep',
        name: 'Enter content details',
        text: 'Input your article title or Moments caption in Chinese or English'
      },
      {
        '@type': 'HowToStep',
        name: 'Generate and customize',
        text: 'AI creates culturally-appropriate covers in WeChat dimensions'
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-green-600 to-green-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-3xl">
                  <MessageCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                微信 WeChat Cover Maker
              </h1>
              
              <p className="text-xl md:text-2xl text-green-50 mb-8 leading-relaxed">
                Create covers that <span className="bg-white text-green-700 px-2 py-1 rounded font-semibold">connect & convert</span> in 
                China's super-app. AI-powered designs for WeChat success.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href={`/${locale}#generator`}>
                  <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 px-8 py-6 text-lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create WeChat Covers
                  </Button>
                </Link>
                <Link href={`/${locale}#pricing`}>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-green-700 px-8 py-6 text-lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
              
              <p className="text-green-100">
                1.3B+ users • Essential for China market • Brand-safe designs
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Built for WeChat Ecosystem
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-green-100 rounded-2xl">
                        <feature.icon className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* WeChat Formats */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                All WeChat Content Formats
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold mb-3">Moments Cover</h3>
                  <p className="text-gray-600 mb-4">Eye-catching covers for your WeChat Moments posts that drive engagement.</p>
                  <p className="text-sm text-green-600 font-medium">1080 x 1080px (Square)</p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">📰</div>
                  <h3 className="text-xl font-semibold mb-3">Article Header</h3>
                  <p className="text-gray-600 mb-4">Professional headers for WeChat official account articles.</p>
                  <p className="text-sm text-green-600 font-medium">900 x 500px (16:9)</p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🏪</div>
                  <h3 className="text-xl font-semibold mb-3">Mini-Program Banner</h3>
                  <p className="text-gray-600 mb-4">Attractive banners for WeChat mini-program promotion.</p>
                  <p className="text-sm text-green-600 font-medium">750 x 400px</p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-3">Ad Campaign Graphics</h3>
                  <p className="text-gray-600 mb-4">Conversion-focused designs for WeChat advertising.</p>
                  <p className="text-sm text-green-600 font-medium">Multiple formats supported</p>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-2xl font-semibold text-center mb-6">Popular WeChat Content Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    '🛍️ E-commerce',
                    '📚 Education',
                    '🏢 Corporate News',
                    '🍜 Food & Dining',
                    '🏨 Travel & Tourism',
                    '💰 Finance & Investment',
                    '🏥 Healthcare',
                    '🎮 Gaming',
                    '👶 Parenting'
                  ].map((type) => (
                    <div key={type} className="bg-green-50 rounded-xl p-4 text-center">
                      <span className="font-medium">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* China Market Focus */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Designed for Chinese Market Success
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="text-4xl font-bold text-green-600 mb-2">1.3B</div>
                  <p className="text-gray-600">Monthly active users on WeChat</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="text-4xl font-bold text-green-600 mb-2">90%</div>
                  <p className="text-gray-600">of Chinese internet users on WeChat</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="text-4xl font-bold text-green-600 mb-2">45min</div>
                  <p className="text-gray-600">Average daily usage per user</p>
                </div>
              </div>

              <div className="mt-12 bg-green-50 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold mb-6 text-center">Cultural Design Elements</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <ul className="space-y-3 text-gray-700">
                    <li>• Red & gold for prosperity themes</li>
                    <li>• Minimalist layouts with breathing room</li>
                    <li>• Traditional patterns for festivals</li>
                  </ul>
                  <ul className="space-y-3 text-gray-700">
                    <li>• QR code integration best practices</li>
                    <li>• Chinese typography optimization</li>
                    <li>• Lucky number considerations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                WeChat Content Best Practices
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">🎯 Clear Value Proposition</h3>
                    <p className="text-gray-600">
                      Chinese users expect immediate value. Our AI ensures your message is crystal clear.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">🏮 Cultural Sensitivity</h3>
                    <p className="text-gray-600">
                      Designs that respect Chinese culture and resonate with local preferences.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">📱 Mobile-Only Platform</h3>
                    <p className="text-gray-600">
                      All designs optimized for mobile viewing and sharing within WeChat.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">🔗 QR Code Integration</h3>
                    <p className="text-gray-600">
                      Smart layouts that seamlessly incorporate QR codes for easy following.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-green-700 to-green-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Succeed on WeChat?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Create covers that connect with 1.3 billion users
            </p>
            <Link href={`/${locale}#generator`}>
              <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 px-8 py-6 text-lg font-semibold">
                Start Creating WeChat Covers
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}