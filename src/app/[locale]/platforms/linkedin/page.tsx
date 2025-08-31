import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Linkedin, Briefcase, TrendingUp, Users, Award, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'LinkedIn Banner & Post Image Maker - Professional Graphics',
  description: 'Create professional LinkedIn banners, post images, and article covers with AI. Boost your professional presence and engagement on LinkedIn.',
  keywords: [
    'LinkedIn banner maker',
    'LinkedIn post image generator',
    'LinkedIn article cover',
    'professional banner creator',
    'LinkedIn graphics generator',
    'LinkedIn profile banner',
    'business graphics maker',
    'LinkedIn carousel creator',
    'professional branding',
    'LinkedIn marketing tools'
  ],
  openGraph: {
    title: 'LinkedIn Graphics Maker - CoverGen AI',
    description: 'Create professional LinkedIn graphics that boost engagement. AI-powered banners, post images, and article covers.',
    images: ['/linkedin-graphics-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.ai/platforms/linkedin',
  },
}

const features = [
  {
    icon: Briefcase,
    title: 'Professional Design',
    description: 'Corporate-ready graphics that enhance credibility'
  },
  {
    icon: TrendingUp,
    title: 'Engagement Boost',
    description: 'Eye-catching visuals that increase post reach'
  },
  {
    icon: Users,
    title: 'Network Growth',
    description: 'Stand out in feeds and attract connections'
  },
  {
    icon: Award,
    title: 'Brand Authority',
    description: 'Build thought leadership with polished visuals'
  }
]

export default function LinkedInGraphicsMaker() {
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create Professional LinkedIn Graphics',
    description: 'Step-by-step guide to creating LinkedIn banners, post images, and article covers with AI',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Choose graphic type',
        text: 'Select from profile banner, post image, article cover, or carousel'
      },
      {
        '@type': 'HowToStep',
        name: 'Upload professional assets',
        text: 'Add your headshot, company logo, or brand colors'
      },
      {
        '@type': 'HowToStep',
        name: 'Define your message',
        text: 'Input your professional tagline or post topic'
      },
      {
        '@type': 'HowToStep',
        name: 'Generate and refine',
        text: 'AI creates multiple professional options in LinkedIn dimensions'
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
        <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-3xl">
                  <Linkedin className="w-12 h-12 text-blue-700" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                LinkedIn Graphics Maker
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Create graphics that <span className="bg-white text-blue-700 px-2 py-1 rounded font-semibold">command attention</span> in 
                professional feeds. AI-powered designs for LinkedIn success.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/#generator">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create LinkedIn Graphics
                  </Button>
                </Link>
                <Link href="/#pricing">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-700 px-8 py-6 text-lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
              
              <p className="text-blue-200">
                Trusted by executives • Boost engagement by 5x • Professional templates
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Built for LinkedIn Professionals
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-blue-100 rounded-2xl">
                        <feature.icon className="w-8 h-8 text-blue-600" />
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

        {/* Graphic Types */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                LinkedIn Graphics for Every Need
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🖼️</div>
                  <h3 className="text-xl font-semibold mb-3">Profile Banner</h3>
                  <p className="text-gray-600 mb-4">Make a strong first impression with a professional banner that showcases your expertise.</p>
                  <p className="text-sm text-blue-600 font-medium">1584 x 396 pixels</p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold mb-3">Post Images</h3>
                  <p className="text-gray-600 mb-4">Boost engagement with eye-catching visuals for your LinkedIn posts and updates.</p>
                  <p className="text-sm text-blue-600 font-medium">1200 x 627 pixels</p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">📰</div>
                  <h3 className="text-xl font-semibold mb-3">Article Covers</h3>
                  <p className="text-gray-600 mb-4">Create compelling covers for LinkedIn articles that drive readership.</p>
                  <p className="text-sm text-blue-600 font-medium">1280 x 720 pixels</p>
                </div>
                
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4">🎠</div>
                  <h3 className="text-xl font-semibold mb-3">Carousel Posts</h3>
                  <p className="text-gray-600 mb-4">Design swipeable carousel posts that tell your professional story.</p>
                  <p className="text-sm text-blue-600 font-medium">1080 x 1080 pixels</p>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-2xl font-semibold text-center mb-6">Popular LinkedIn Content Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    '💡 Thought Leadership',
                    '📊 Industry Insights',
                    '🎯 Career Advice',
                    '🚀 Company Updates',
                    '📈 Success Stories',
                    '🤝 Networking Tips',
                    '📚 Educational Content',
                    '💼 Job Postings',
                    '🏆 Achievements'
                  ].map((type) => (
                    <div key={type} className="bg-blue-50 rounded-xl p-4 text-center">
                      <span className="font-medium">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LinkedIn Stats */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                The Power of Visual Content on LinkedIn
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="bg-blue-50 rounded-2xl p-8">
                  <div className="text-4xl font-bold text-blue-600 mb-2">2x</div>
                  <p className="text-gray-600">more engagement with images vs text-only posts</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-8">
                  <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
                  <p className="text-gray-600">more comments on posts with custom graphics</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-8">
                  <div className="text-4xl font-bold text-blue-600 mb-2">900M+</div>
                  <p className="text-gray-600">professionals active on LinkedIn</p>
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
                LinkedIn Visual Best Practices
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">🎯 Professional Polish</h3>
                    <p className="text-gray-600">
                      Maintain a clean, professional aesthetic. Our AI ensures your graphics reflect corporate standards.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">📊 Data Visualization</h3>
                    <p className="text-gray-600">
                      Transform insights into compelling visuals. AI helps create infographics that drive engagement.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">🎨 Brand Consistency</h3>
                    <p className="text-gray-600">
                      Keep your visual identity consistent. Upload brand assets for cohesive professional presence.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">💬 Clear Messaging</h3>
                    <p className="text-gray-600">
                      Combine visuals with concise text. Our AI balances imagery and copy for maximum impact.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-700 to-blue-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Elevate Your LinkedIn Presence?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Join professionals creating standout LinkedIn content with AI
            </p>
            <Link href="/#generator">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg font-semibold">
                Start Creating Professional Graphics
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}