'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Zap, Palette, Download, Smartphone, TrendingUp, Star, Users, ArrowRight } from 'lucide-react'

interface InstagramThumbnailMakerClientProps {
  locale: string
  translations: any
}

export default function InstagramThumbnailMakerClient({ locale, translations }: InstagramThumbnailMakerClientProps) {
  const isZh = locale === 'zh'

  const features = [
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: isZh ? '完美适配 Instagram 尺寸' : 'Perfect Instagram Sizes',
      description: isZh 
        ? '自动适配 Reels (9:16)、Feed (1:1) 和 Stories (9:16) 的最佳尺寸'
        : 'Auto-optimized for Reels (9:16), Feed (1:1), and Stories (9:16)',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: isZh ? 'AI 智能生成' : 'AI-Powered Generation',
      description: isZh 
        ? '使用先进的 AI 技术，根据您的内容自动生成吸引人的缩略图'
        : 'Advanced AI technology creates engaging thumbnails based on your content',
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: isZh ? 'Instagram 风格模板' : 'Instagram-Style Templates',
      description: isZh 
        ? '专为 Instagram 算法优化的时尚模板，提升曝光率'
        : 'Trendy templates optimized for Instagram algorithm and engagement',
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: isZh ? '高清无水印下载' : 'HD Download, No Watermark',
      description: isZh 
        ? '导出高清图片，完全无水印，直接发布到 Instagram'
        : 'Export high-quality images with no watermark, ready for Instagram',
    },
  ]

  const templates = [
    { id: 1, name: isZh ? '时尚 Reels' : 'Fashion Reels', category: 'reels' },
    { id: 2, name: isZh ? '美食分享' : 'Food Posts', category: 'feed' },
    { id: 3, name: isZh ? '旅行故事' : 'Travel Stories', category: 'stories' },
    { id: 4, name: isZh ? '健身动态' : 'Fitness Content', category: 'reels' },
    { id: 5, name: isZh ? '美妆教程' : 'Beauty Tutorials', category: 'feed' },
    { id: 6, name: isZh ? '生活记录' : 'Lifestyle Vlogs', category: 'stories' },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: isZh ? "时尚博主" : "Fashion Influencer",
      content: isZh 
        ? "这个工具让我的 Instagram 内容更加专业！Reels 的观看量提升了 300%。"
        : "This tool made my Instagram content look so professional! My Reels views increased by 300%.",
      rating: 5,
    },
    {
      name: "Mike Johnson",
      role: isZh ? "健身教练" : "Fitness Coach",
      content: isZh 
        ? "完美的尺寸和模板选择，节省了大量时间。强烈推荐！"
        : "Perfect sizes and template selection. Saved me hours of work. Highly recommend!",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              <TrendingUp className="mr-1 h-3 w-3" />
              {isZh ? 'KD: 10 - 超低竞争关键词' : 'KD: 10 - Ultra Low Competition'}
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              {isZh ? 'Instagram 缩略图制作工具' : 'Instagram Thumbnail Maker'}
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
              {isZh 
                ? '为您的 Reels、Feed 和 Stories 创建令人惊艳的缩略图。使用 AI 技术和专业模板，让您的 Instagram 内容脱颖而出。'
                : 'Create stunning thumbnails for your Reels, Feed posts, and Stories. Stand out on Instagram with AI-powered designs and professional templates.'}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                {isZh ? '免费开始制作' : 'Start Creating Free'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                {isZh ? '查看模板库' : 'Browse Templates'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? '为什么选择我们的 Instagram 缩略图制作工具？' : 'Why Choose Our Instagram Thumbnail Maker?'}
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-pink-100 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600 dark:from-pink-900 dark:to-purple-900 dark:text-pink-400">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? 'Instagram 专属模板' : 'Instagram-Optimized Templates'}
          </h2>
          <p className="mb-12 text-center text-lg text-gray-600 dark:text-gray-300">
            {isZh 
              ? '选择适合您内容风格的专业模板，快速创建吸引人的缩略图'
              : 'Choose from professional templates designed for your content style'}
          </p>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
              <TabsTrigger value="all">{isZh ? '全部' : 'All'}</TabsTrigger>
              <TabsTrigger value="reels">Reels</TabsTrigger>
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="stories">Stories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900" />
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary">{template.category}</Badge>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? '如何制作 Instagram 缩略图' : 'How to Create Instagram Thumbnails'}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">{isZh ? '选择格式' : 'Choose Format'}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {isZh ? '选择 Reels、Feed 或 Stories 格式' : 'Select Reels, Feed, or Stories format'}
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">{isZh ? '自定义设计' : 'Customize Design'}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {isZh ? '添加文字、贴纸和滤镜' : 'Add text, stickers, and filters'}
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">{isZh ? '下载发布' : 'Download & Post'}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {isZh ? '高清下载，直接发布到 Instagram' : 'Download in HD and post to Instagram'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? '用户好评' : 'What Our Users Say'}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-pink-100">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {isZh 
              ? '立即开始创建专业的 Instagram 缩略图'
              : 'Start Creating Professional Instagram Thumbnails Today'}
          </h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
            {isZh 
              ? '加入数千名内容创作者，使用我们的工具提升 Instagram 互动率'
              : 'Join thousands of content creators using our tool to boost Instagram engagement'}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {isZh ? '免费制作缩略图' : 'Create Thumbnail Free'}
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Users className="h-4 w-4" />
              <span>{isZh ? '已有 10,000+ 创作者使用' : '10,000+ creators already using'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": isZh ? "Instagram 缩略图的最佳尺寸是多少？" : "What are the best sizes for Instagram thumbnails?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": isZh 
                    ? "Reels 和 Stories 使用 9:16 (1080x1920px)，Feed 帖子使用 1:1 (1080x1080px)。"
                    : "Use 9:16 (1080x1920px) for Reels and Stories, and 1:1 (1080x1080px) for Feed posts."
                }
              },
              {
                "@type": "Question",
                "name": isZh ? "这个工具是免费的吗？" : "Is this tool free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": isZh 
                    ? "是的，基础功能完全免费，包括模板和高清下载。"
                    : "Yes, basic features including templates and HD downloads are completely free."
                }
              }
            ]
          })
        }}
      />
    </div>
  )
}