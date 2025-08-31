'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, HelpCircle, MessageCircle, BookOpen, Video, Image, Settings, Zap } from 'lucide-react'

const faqCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    description: 'Learn the basics of CoverGen AI',
    faqs: [
      {
        question: 'How do I create my first cover image?',
        answer: 'Upload a reference image, enter your title, select a platform, and click generate. Our AI will create multiple cover options in seconds.'
      },
      {
        question: 'What image formats are supported?',
        answer: 'We support JPEG, PNG, and WebP formats. Upload images up to 50MB for best results.'
      },
      {
        question: 'How many images can I generate?',
        answer: 'Free users get 10 generations per day. Pro users get 50 per month, and Pro+ users get 200 per month.'
      }
    ]
  },
  {
    id: 'platforms',
    title: 'Platform Support',
    icon: Video,
    description: 'Optimize for different social media platforms',
    faqs: [
      {
        question: 'Which platforms are supported?',
        answer: 'We support YouTube, Twitch, Spotify, TikTok, Bilibili, Xiaohongshu, and custom dimensions.'
      },
      {
        question: 'How do platform-specific optimizations work?',
        answer: 'Our AI automatically adjusts your cover to match each platform\'s best practices and dimensions for maximum engagement.'
      },
      {
        question: 'Can I use the same image for multiple platforms?',
        answer: 'Yes! Generate once and download in different sizes optimized for each platform.'
      }
    ]
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    icon: Image,
    description: 'Understanding our AI generation capabilities',
    faqs: [
      {
        question: 'How does the AI understand my content?',
        answer: 'Our AI analyzes your title, reference image, and selected style to create covers that match your brand and content theme.'
      },
      {
        question: 'Can I customize the AI generation style?',
        answer: 'Yes! Choose from various style templates like tech, lifestyle, minimal, cartoon, and more to match your brand aesthetic.'
      },
      {
        question: 'What makes CoverGen AI different?',
        answer: 'We focus on maintaining brand consistency while creating engaging covers that drive clicks and engagement.'
      }
    ]
  },
  {
    id: 'account-billing',
    title: 'Account & Billing',
    icon: Settings,
    description: 'Manage your account and subscription',
    faqs: [
      {
        question: 'How do I upgrade to Pro?',
        answer: 'Click the upgrade button in your dashboard or visit the pricing page to choose your plan. All plans include a 7-day free trial.'
      },
      {
        question: 'Can I cancel my subscription?',
        answer: 'Yes, you can cancel anytime from your account settings. Your access continues until the end of your billing period.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Use the "Forgot Password" link on the login page. We\'ll send you a reset link via email.'
      }
    ]
  }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('getting-started')

  const filteredFAQs = faqCategories.flatMap(category => 
    category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Help Center
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers to common questions and learn how to get the most out of CoverGen AI
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for help articles, tutorials, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-2 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              {faqCategories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      activeCategory === category.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{category.title}</div>
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {searchQuery ? (
              // Search Results
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">
                  Search Results for "{searchQuery}" ({filteredFAQs.length} results)
                </h2>
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try different keywords or browse our categories below
                    </p>
                    <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
                  </div>
                )}
              </div>
            ) : (
              // Category Content
              <div className="space-y-8">
                {faqCategories
                  .filter(category => category.id === activeCategory)
                  .map(category => (
                    <div key={category.id}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <category.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{category.title}</h2>
                          <p className="text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {category.faqs.map((faq, index) => (
                          <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                              <CardTitle className="text-lg">{faq.question}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-16 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900 rounded-2xl p-8">
          <div className="text-center max-w-2xl mx-auto">
            <MessageCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help you get the most out of CoverGen AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary/90">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Tutorials
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
