import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, LucideIcon } from 'lucide-react'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

interface PlatformLandingTemplateProps {
  platform: {
    name: string
    icon: LucideIcon
    color: string
    gradientFrom: string
    gradientTo: string
  }
  title: string
  subtitle: string
  features: Feature[]
  templates: string[]
  bestPractices: Array<{
    title: string
    description: string
    icon?: string
  }>
  ctaText?: string
  structuredData?: object
}

export default function PlatformLandingTemplate({
  platform,
  title,
  subtitle,
  features,
  templates,
  bestPractices,
  ctaText = 'Start Creating',
  structuredData
}: PlatformLandingTemplateProps) {
  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className={`py-20 bg-gradient-to-br from-${platform.gradientFrom} to-${platform.gradientTo}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className={`p-4 ${platform.color} rounded-3xl`}>
                  <platform.icon className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                {title}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                {subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/#generator">
                  <Button size="lg" className={`${platform.color} text-white px-8 py-6 text-lg`}>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {ctaText}
                  </Button>
                </Link>
                <Link href="/#pricing">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Platform-Specific Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 bg-gradient-to-br from-${platform.gradientFrom} to-${platform.gradientTo} rounded-2xl`}>
                        <feature.icon className="w-8 h-8 text-white" />
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

        {/* Templates Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Templates for Every {platform.name} Niche
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div key={template} className="bg-white rounded-2xl p-4 text-center hover:shadow-lg transition-shadow">
                    <span className="text-gray-700 font-medium">{template}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Link href="/#generator">
                  <Button size="lg" className={`${platform.color} text-white`}>
                    Explore All Templates
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                {platform.name} Cover Best Practices
              </h2>
              
              <div className="space-y-6">
                {bestPractices.map((practice, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-3">
                      {practice.icon && <span className="mr-2">{practice.icon}</span>}
                      {practice.title}
                    </h3>
                    <p className="text-gray-600">{practice.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-20 bg-gradient-to-br ${platform.color} text-white`}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Create Amazing {platform.name} Content?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Join thousands of creators using AI for professional covers
            </p>
            <Link href="/#generator">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                Create Your First Cover Free
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}