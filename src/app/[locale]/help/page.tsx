'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, HelpCircle, MessageCircle, BookOpen, Video, Image, Settings, Zap } from 'lucide-react'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'

// Get configuration for use in the FAQ content
const config = getClientSubscriptionConfig()

const faqCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    description: 'Learn the basics of CoverGen AI',
    faqs: [
      {
        question: 'How do I create my first cover image or video?',
        answer: 'For images: Upload a reference image, enter your title, select a platform, and click generate. For videos: Go to Sora generator, enter a text prompt, choose aspect ratio, and generate. Our AI creates multiple options in seconds.'
      },
      {
        question: 'What image formats are supported?',
        answer: 'We support JPEG, PNG, and WebP formats. Upload images up to 5MB for best results.'
      },
      {
        question: 'How many images and videos can I generate?',
        answer: 'Free: 10 images + 5 videos/month (3 images + 1 video daily). Pro ($16.99): 100 images + 30 videos/month. Pro+ ($29.99): 200 images + 60 videos/month. Pro/Pro+ have no fixed daily limits.'
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
    id: 'sora-video',
    title: 'Sora 2 Video Generation',
    icon: Video,
    description: 'AI-powered video creation with OpenAI Sora 2',
    faqs: [
      {
        question: 'What is Sora 2 video generation?',
        answer: 'Sora 2 is OpenAI\'s advanced AI video generation model that creates high-quality videos from text prompts. Perfect for YouTube intros, social media content, promotional videos, and more.'
      },
      {
        question: 'How do I create a Sora 2 video?',
        answer: 'Navigate to the Sora video generator, enter your text prompt describing the video you want, select aspect ratio (16:9 for YouTube, 9:16 for TikTok/Shorts, 1:1 for Instagram), and click generate. Your video will be ready in 30-60 seconds.'
      },
      {
        question: 'What are the video generation limits?',
        answer: `Free plan: 5 videos/month with 1 video daily limit. Pro plan ($16.99/month): 30 videos/month. Pro+ plan ($29.99/month): 60 videos/month. Pro and Pro+ users have no fixed daily limits.`
      },
      {
        question: 'How long does video generation take?',
        answer: 'Sora 2 video generation typically takes 2-5 minutes depending on video length and complexity. The process involves multiple AI processing steps to ensure high-quality output with smooth motion, accurate scene composition, and natural lighting. You\'ll receive a notification when your video is ready, and Pro users get priority processing for faster results.'
      },
      {
        question: 'What video formats and quality are available?',
        answer: 'Sora 2 generates videos in MP4 format with two quality options: Standard (720p) and HD (1080p). You can choose between landscape (16:9) and portrait (9:16) aspect ratios to perfectly match your platform needs - YouTube, TikTok, Instagram Reels, and more. All videos include natural camera movements, realistic lighting, and professional-grade visual quality.'
      },
      {
        question: 'Can I use Sora 2 videos commercially?',
        answer: 'Free plan allows personal use only. Pro plan includes commercial usage rights for your business and content. Pro+ plan provides full commercial license including client work and team usage.'
      },
      {
        question: 'How do I write effective video prompts?',
        answer: 'Be specific and descriptive. Include details about: subject/scene, visual style, camera movement, lighting, and mood. Example: "A serene beach sunset with gentle waves, cinematic drone shot, warm golden hour lighting, peaceful atmosphere."'
      },
      {
        question: 'What makes Sora 2 different from other AI video tools?',
        answer: 'Sora 2 offers superior video quality with realistic motion, better physics understanding, and consistent character/scene coherence. It creates longer, more complex videos with professional-grade output suitable for content creators and businesses.'
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
        question: 'What are the usage rights for each plan?',
        answer: 'Free plan: Personal use only. Pro plan: Personal and commercial use allowed. Pro+ plan: Full commercial license with extended rights for teams and enterprises.'
      },
      {
        question: 'How do I upgrade to Pro?',
        answer: 'Click the upgrade button in your dashboard or visit the pricing page to choose your plan.'
      },
      {
        question: 'Can I cancel my subscription?',
        answer: 'Yes, you can cancel anytime from your account settings. Your access continues until the end of your billing period.'
      },
      {
        question: 'What\'s included in Pro and Pro+ plans?',
        answer: 'Pro ($16.99/month): 100 images + 30 videos, all features, commercial rights. Pro+ ($29.99/month): 200 images + 60 videos, priority generation, enhanced features, full commercial license for teams and client work.'
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
            <h1 className="text-hero-title mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Help Center
            </h1>
            <p className="text-body-lg text-muted-foreground mb-8">
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
              <h3 className="text-heading-5 mb-4">Categories</h3>
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
                <h2 className="text-heading-4 mb-6">
                  Search Results for "{searchQuery}" ({filteredFAQs.length} results)
                </h2>
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-ui-lg mb-3">{faq.question}</h3>
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-heading-5 mb-2">No results found</h3>
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
                          <h2 className="text-heading-4">{category.title}</h2>
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
            <h3 className="text-heading-4 mb-2">Still need help?</h3>
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
