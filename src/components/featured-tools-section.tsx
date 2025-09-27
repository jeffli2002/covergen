'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Image, 
  Briefcase, 
  TrendingUp, 
  ArrowRight,
  Zap,
  Star
} from 'lucide-react'

interface FeaturedToolsSectionProps {
  locale: string
}

export default function FeaturedToolsSection({ locale }: FeaturedToolsSectionProps) {
  const isZh = locale === 'zh'

  const featuredTools = [
    {
      title: isZh ? 'Instagram 缩略图制作器' : 'Instagram Thumbnail Maker',
      description: isZh 
        ? '为 Reels、Feed 和 Stories 创建完美的缩略图。专为 Instagram 算法优化。'
        : 'Create perfect thumbnails for Reels, Feed, and Stories. Optimized for Instagram algorithm.',
      icon: Image,
      href: '/tools/instagram-thumbnail-maker',
      color: 'from-pink-500 to-purple-500',
      badge: { text: 'KD: 10', color: 'bg-green-100 text-green-700' },
      stats: { users: '50K+', rating: 4.9 }
    },
    {
      title: isZh ? 'LinkedIn 横幅制作器' : 'LinkedIn Banner Maker',
      description: isZh 
        ? '创建专业的个人资料横幅，提升您的职业形象和曝光率。'
        : 'Create professional profile banners that enhance your career visibility.',
      icon: Briefcase,
      href: '/tools/linkedin-banner-maker',
      color: 'from-blue-600 to-blue-700',
      badge: { text: 'KD: 7', color: 'bg-blue-100 text-blue-700' },
      stats: { users: '200K+', rating: 4.8 }
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Zap className="mr-1 h-3 w-3" />
              {isZh ? '热门工具' : 'Trending Tools'}
            </Badge>
            <h2 className="text-section-title text-gray-900 dark:text-white mb-4">
              {isZh ? '专业设计工具，完全免费' : 'Professional Design Tools, Completely Free'}
            </h2>
            <p className="text-body-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {isZh 
                ? '使用我们的 AI 驱动工具，为您的内容创建引人注目的视觉效果。无需设计经验。'
                : 'Create eye-catching visuals for your content with our AI-powered tools. No design experience needed.'}
            </p>
          </div>

          {/* Featured Tools Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {featuredTools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700 relative overflow-hidden">
                  {/* Gradient background effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <Badge className={tool.badge.color}>
                        {tool.badge.text}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-xl mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <span>{tool.stats.users} {isZh ? '用户' : 'users'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-600 dark:text-gray-300">{tool.stats.rating}</span>
                      </div>
                    </div>
                    
                    <Link href={`/${locale}${tool.href}`}>
                      <Button className="w-full group/btn" variant="outline">
                        {isZh ? '开始使用' : 'Start Using'}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* SEO Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {isZh 
                ? '为什么选择我们的设计工具？'
                : 'Why Choose Our Design Tools?'}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {isZh ? '🎨 专业品质，零成本' : '🎨 Professional Quality, Zero Cost'}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {isZh 
                    ? '我们相信每个人都应该能够创建专业的视觉内容。所有工具完全免费，无水印，无限制。'
                    : 'We believe everyone should be able to create professional visuals. All tools are completely free, no watermarks, no limitations.'}
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {isZh ? '🚀 AI 驱动，即时生成' : '🚀 AI-Powered, Instant Generation'}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {isZh 
                    ? '利用最新的 AI 技术，在几秒钟内生成专业设计。无需设计技能或复杂软件。'
                    : 'Leveraging cutting-edge AI technology to generate professional designs in seconds. No design skills or complex software required.'}
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {isZh ? '📱 完美适配所有平台' : '📱 Perfect for Every Platform'}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {isZh 
                    ? '每个工具都针对特定平台优化，确保您的内容在 Instagram、LinkedIn、YouTube 等平台上完美展示。'
                    : 'Each tool is optimized for specific platforms, ensuring your content looks perfect on Instagram, LinkedIn, YouTube, and more.'}
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {isZh ? '⚡ 节省时间，提高效率' : '⚡ Save Time, Boost Productivity'}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {isZh 
                    ? '将设计时间从几小时缩短到几分钟。专注于创作内容，让 AI 处理视觉设计。'
                    : 'Reduce design time from hours to minutes. Focus on creating content while AI handles the visual design.'}
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link href={`/${locale}/tools`}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  {isZh ? '探索所有工具' : 'Explore All Tools'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}