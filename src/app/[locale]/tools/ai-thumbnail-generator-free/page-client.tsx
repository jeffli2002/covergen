'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkles, 
  Zap, 
  Brain, 
  Wand2, 
  Image, 
  TrendingUp, 
  Clock, 
  Shield,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  Rocket,
  Download
} from 'lucide-react'

interface AIThumbnailGeneratorClientProps {
  locale: string
  translations: any
}

export default function AIThumbnailGeneratorClient({ locale, translations }: AIThumbnailGeneratorClientProps) {
  const isZh = locale === 'zh'
  const [selectedPlatform, setSelectedPlatform] = useState('all')

  const aiFeatures = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: isZh ? '智能内容理解' : 'Smart Content Understanding',
      description: isZh 
        ? 'AI 分析您的标题和描述，自动生成最匹配的视觉效果'
        : 'AI analyzes your title and description to generate perfectly matched visuals',
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: isZh ? '多样化风格选择' : 'Multiple Style Options',
      description: isZh 
        ? '每次生成 4 个不同风格的缩略图供您选择'
        : 'Get 4 different style variations with each generation to choose from',
    },
    {
      icon: <Wand2 className="h-6 w-6" />,
      title: isZh ? '一键优化' : 'One-Click Enhancement',
      description: isZh 
        ? 'AI 自动优化色彩、对比度和构图，确保最佳视觉效果'
        : 'AI automatically optimizes colors, contrast, and composition for best results',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: isZh ? '完全免费无水印' : 'Completely Free, No Watermark',
      description: isZh 
        ? '所有功能免费使用，导出高清图片无任何水印'
        : 'All features free to use, export HD images without any watermark',
    },
  ]

  const platforms = [
    { id: 'youtube', name: 'YouTube', users: '2.7B', growth: '+15%' },
    { id: 'tiktok', name: 'TikTok', users: '1.2B', growth: '+45%' },
    { id: 'instagram', name: 'Instagram', users: '2.4B', growth: '+22%' },
    { id: 'twitch', name: 'Twitch', users: '140M', growth: '+35%' },
  ]

  const comparisonData = [
    {
      feature: isZh ? '价格' : 'Price',
      us: isZh ? '完全免费' : 'Completely Free',
      canva: '$12.99/月',
      photoshop: '$20.99/月',
    },
    {
      feature: isZh ? 'AI 生成' : 'AI Generation',
      us: '✓',
      canva: isZh ? '有限' : 'Limited',
      photoshop: '✗',
    },
    {
      feature: isZh ? '无水印' : 'No Watermark',
      us: '✓',
      canva: isZh ? '付费版' : 'Paid only',
      photoshop: '✓',
    },
    {
      feature: isZh ? '生成速度' : 'Generation Speed',
      us: isZh ? '10秒' : '10 seconds',
      canva: isZh ? '手动设计' : 'Manual design',
      photoshop: isZh ? '手动设计' : 'Manual design',
    },
  ]

  const testimonials = [
    {
      name: "Alex Thompson",
      role: isZh ? "YouTube 创作者" : "YouTube Creator",
      subscribers: "1.2M",
      content: isZh 
        ? "AI 生成的缩略图让我的点击率提升了 85%！再也不用花几小时设计了。"
        : "AI-generated thumbnails increased my CTR by 85%! No more spending hours on design.",
      rating: 5,
    },
    {
      name: "Lisa Wang",
      role: isZh ? "TikTok 网红" : "TikTok Influencer",
      subscribers: "500K",
      content: isZh 
        ? "完全免费还没有水印，生成的效果比付费工具还好！"
        : "Completely free with no watermark, and the results are better than paid tools!",
      rating: 5,
    },
    {
      name: "David Kim",
      role: isZh ? "内容营销经理" : "Content Marketing Manager",
      subscribers: "B2B",
      content: isZh 
        ? "为我们团队节省了大量时间和设计成本。AI 理解能力令人印象深刻。"
        : "Saved our team tons of time and design costs. The AI understanding is impressive.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <TrendingUp className="mr-1 h-3 w-3" />
                {isZh ? 'KD: 21 | 增长 +900%' : 'KD: 21 | Growth +900%'}
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-600">
                <Zap className="mr-1 h-3 w-3" />
                {isZh ? '热门趋势' : 'Trending Hot'}
              </Badge>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              {isZh ? '免费 AI 缩略图生成器' : 'AI Thumbnail Generator Free'}
              <span className="mt-2 block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isZh ? '智能创作，瞬间完成' : 'Smart Creation, Instant Results'}
              </span>
            </h1>
            
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
              {isZh 
                ? '利用先进的 AI 技术，根据您的内容自动生成专业缩略图。支持所有主流平台，完全免费，无需设计经验。'
                : 'Generate professional thumbnails automatically using advanced AI technology. Works for all major platforms, completely free, no design skills needed.'}
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Sparkles className="mr-2 h-5 w-5" />
                {isZh ? '立即免费生成' : 'Generate Free Now'}
              </Button>
              <Button size="lg" variant="outline">
                <Image className="mr-2 h-5 w-5" />
                {isZh ? '查看 AI 示例' : 'View AI Examples'}
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{isZh ? '平均 10 秒生成' : '10s average generation'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{isZh ? '50万+ 用户信赖' : '500K+ users trust us'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{isZh ? '1000万+ 缩略图生成' : '10M+ thumbnails created'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? 'AI 技术，重新定义缩略图创作' : 'AI Technology Redefines Thumbnail Creation'}
          </h2>
          <p className="mb-12 text-center text-lg text-gray-600 dark:text-gray-300">
            {isZh 
              ? '告别繁琐的设计过程，让 AI 帮您快速创建吸引眼球的缩略图'
              : 'Say goodbye to tedious design process, let AI help you create eye-catching thumbnails quickly'}
          </p>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-blue-100">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 group-hover:scale-110 transition-transform dark:from-blue-900 dark:to-purple-900 dark:text-blue-400">
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

      {/* Platform Support */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? '支持所有主流平台' : 'Works with All Major Platforms'}
          </h2>
          
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {platforms.map((platform) => (
              <Card key={platform.id} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl">{platform.name}</CardTitle>
                  <div className="mt-2 space-y-1">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{platform.users}</p>
                    <Badge variant="secondary" className="text-green-600">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {platform.growth}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedPlatform(platform.id)}
                  >
                    {isZh ? '生成缩略图' : 'Generate'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? '为什么选择我们？' : 'Why Choose Us?'}
          </h2>
          <p className="mb-12 text-center text-lg text-gray-600 dark:text-gray-300">
            {isZh 
              ? '与其他工具的对比，我们的优势一目了然'
              : 'Compare with other tools, our advantages are clear'}
          </p>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-4 text-left font-medium text-gray-900 dark:text-white">
                        {isZh ? '功能对比' : 'Feature Comparison'}
                      </th>
                      <th className="px-6 py-4 text-center">
                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                          {isZh ? '我们的 AI 生成器' : 'Our AI Generator'}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-gray-500">Canva</th>
                      <th className="px-6 py-4 text-center text-gray-500">Photoshop</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {row.feature}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {row.us}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-500">{row.canva}</td>
                        <td className="px-6 py-4 text-center text-gray-500">{row.photoshop}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? '创作者的真实反馈' : 'Real Feedback from Creators'}
          </h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                      <Badge variant="secondary" className="mt-2">
                        <Users className="mr-1 h-3 w-3" />
                        {testimonial.subscribers}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
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
        <div className="mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-12 text-center">
              <Rocket className="mx-auto mb-4 h-12 w-12" />
              <h2 className="mb-4 text-3xl font-bold">
                {isZh 
                  ? '立即体验 AI 的力量'
                  : 'Experience the Power of AI Now'}
              </h2>
              <p className="mb-8 text-lg opacity-90">
                {isZh 
                  ? '加入 50 万创作者的行列，用 AI 提升您的内容质量'
                  : 'Join 500K creators using AI to enhance their content quality'}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {isZh ? '免费开始使用' : 'Start Free Now'}
                </Button>
                <p className="text-sm opacity-90">
                  {isZh ? '无需信用卡 · 永久免费' : 'No credit card · Free forever'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "AI Thumbnail Generator Free",
            "applicationCategory": "DesignApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "12543"
            }
          })
        }}
      />
    </div>
  )
}