'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  Building2, 
  Award,
  Target,
  Palette,
  Download,
  ArrowRight,
  CheckCircle2,
  Star,
  BarChart3,
  Globe,
  Linkedin
} from 'lucide-react'

interface LinkedInBannerMakerClientProps {
  locale: string
  translations: any
}

export default function LinkedInBannerMakerClient({ locale, translations }: LinkedInBannerMakerClientProps) {
  const isZh = locale === 'zh'

  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: isZh ? 'LinkedIn 完美尺寸' : 'Perfect LinkedIn Dimensions',
      description: isZh 
        ? '1584x396 像素，专为 LinkedIn 个人资料优化'
        : '1584x396 pixels, optimized for LinkedIn profile headers',
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: isZh ? '专业模板库' : 'Professional Templates',
      description: isZh 
        ? '数百个行业特定模板，展示您的专业形象'
        : 'Hundreds of industry-specific templates to showcase your expertise',
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: isZh ? '品牌一致性' : 'Brand Consistency',
      description: isZh 
        ? '轻松添加公司标志、品牌色彩和职业信息'
        : 'Easily add company logos, brand colors, and professional details',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: isZh ? '提升曝光率' : 'Boost Profile Views',
      description: isZh 
        ? '专业横幅可提升个人资料访问量高达 40%'
        : 'Professional banners can increase profile views by up to 40%',
    },
  ]

  const industries = [
    { name: isZh ? '科技' : 'Technology', count: '150+' },
    { name: isZh ? '金融' : 'Finance', count: '120+' },
    { name: isZh ? '咨询' : 'Consulting', count: '100+' },
    { name: isZh ? '市场营销' : 'Marketing', count: '80+' },
    { name: isZh ? '医疗健康' : 'Healthcare', count: '90+' },
    { name: isZh ? '教育' : 'Education', count: '70+' },
  ]

  const benefits = [
    {
      title: isZh ? '建立专业形象' : 'Build Professional Image',
      description: isZh 
        ? '第一印象决定一切，专业横幅展示您的职业素养'
        : 'First impressions matter - show your professionalism instantly',
      stat: '67%',
      statDesc: isZh ? '的招聘者会查看横幅' : 'of recruiters check banners',
    },
    {
      title: isZh ? '突出个人品牌' : 'Highlight Personal Brand',
      description: isZh 
        ? '用视觉元素强化您的个人品牌和专业定位'
        : 'Reinforce your personal brand and professional positioning',
      stat: '5x',
      statDesc: isZh ? '更容易被记住' : 'more memorable',
    },
    {
      title: isZh ? '增加连接机会' : 'Increase Connections',
      description: isZh 
        ? '优质的个人资料更容易获得有价值的商业连接'
        : 'Quality profiles attract more valuable business connections',
      stat: '+28%',
      statDesc: isZh ? '连接请求增长' : 'connection requests',
    },
  ]

  const testimonials = [
    {
      name: "Michael Chen",
      role: isZh ? "高级产品经理 @ 微软" : "Senior Product Manager @ Microsoft",
      content: isZh 
        ? "专业的 LinkedIn 横幅让我的个人资料访问量增加了 45%，收到了更多猎头的邀请。"
        : "Professional LinkedIn banner increased my profile views by 45% and attracted more recruiter interest.",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      role: isZh ? "营销总监 @ Salesforce" : "Marketing Director @ Salesforce",
      content: isZh 
        ? "终于找到了一个能快速制作专业横幅的工具！节省时间，效果出色。"
        : "Finally found a tool that creates professional banners quickly! Saves time with excellent results.",
      rating: 5,
    },
    {
      name: "David Lee",
      role: isZh ? "创业顾问" : "Startup Consultant",
      content: isZh 
        ? "作为独立顾问，专业形象至关重要。这个工具帮我建立了可信的在线形象。"
        : "As an independent consultant, professional image is crucial. This tool helped establish my credible online presence.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <TrendingUp className="mr-1 h-3 w-3" />
                {isZh ? 'KD: 7 - 超低竞争' : 'KD: 7 - Ultra Low Competition'}
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-600">
                <Linkedin className="mr-1 h-3 w-3" />
                {isZh ? '专业必备' : 'Professional Essential'}
              </Badge>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              {isZh ? 'LinkedIn 横幅制作工具' : 'LinkedIn Banner Maker'}
              <span className="mt-2 block text-3xl text-blue-600 dark:text-blue-400 sm:text-4xl">
                {isZh ? '打造专业的第一印象' : 'Create a Professional First Impression'}
              </span>
            </h1>
            
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
              {isZh 
                ? '为您的 LinkedIn 个人资料创建引人注目的横幅。完美尺寸、专业设计，帮助您在职业社交网络中脱颖而出。'
                : 'Create eye-catching banners for your LinkedIn profile. Perfect dimensions, professional designs to help you stand out in the professional network.'}
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Briefcase className="mr-2 h-5 w-5" />
                {isZh ? '开始制作横幅' : 'Start Creating Banner'}
              </Button>
              <Button size="lg" variant="outline">
                <Palette className="mr-2 h-5 w-5" />
                {isZh ? '浏览专业模板' : 'Browse Templates'}
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{isZh ? '50万+ 专业人士使用' : '500K+ professionals'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{isZh ? '支持 180+ 国家' : '180+ countries'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? '专为 LinkedIn 优化的功能' : 'Features Optimized for LinkedIn'}
          </h2>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-blue-100">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors dark:bg-blue-900 dark:text-blue-400">
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

      {/* Industry Templates */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? '行业专属模板' : 'Industry-Specific Templates'}
          </h2>
          <p className="mb-12 text-center text-lg text-gray-600 dark:text-gray-300">
            {isZh 
              ? '为每个行业精心设计的专业模板'
              : 'Professionally designed templates for every industry'}
          </p>
          
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {industries.map((industry, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{industry.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{industry.count}</p>
                  <p className="text-sm text-gray-500">{isZh ? '模板' : 'templates'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits with Stats */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? '提升您的职业影响力' : 'Boost Your Professional Impact'}
          </h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4 text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {benefit.stat}
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  <CardDescription className="text-sm">{benefit.statDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? '三步创建专业横幅' : 'Create Professional Banner in 3 Steps'}
          </h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="relative text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">{isZh ? '选择行业模板' : 'Choose Industry Template'}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {isZh 
                  ? '从数百个专业设计的行业模板中选择'
                  : 'Select from hundreds of professionally designed industry templates'}
              </p>
              <ArrowRight className="absolute top-20 right-0 hidden md:block h-6 w-6 text-blue-400 -translate-y-1/2 translate-x-1/2" />
            </div>
            
            <div className="relative text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">{isZh ? '个性化定制' : 'Personalize Your Design'}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {isZh 
                  ? '添加您的信息、公司标志和专业成就'
                  : 'Add your information, company logo, and professional achievements'}
              </p>
              <ArrowRight className="absolute top-20 right-0 hidden md:block h-6 w-6 text-blue-400 -translate-y-1/2 translate-x-1/2" />
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">{isZh ? '下载并上传' : 'Download & Upload'}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {isZh 
                  ? '下载完美尺寸的横幅，直接上传到 LinkedIn'
                  : 'Download perfectly sized banner and upload directly to LinkedIn'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? '专业人士的选择' : 'Trusted by Professionals'}
          </h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4 flex items-center justify-between">
                    <Award className="h-8 w-8 text-blue-600" />
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
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
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">
            {isZh 
              ? '立即提升您的 LinkedIn 形象'
              : 'Elevate Your LinkedIn Presence Today'}
          </h2>
          <p className="mb-8 text-lg opacity-90">
            {isZh 
              ? '加入 50 万专业人士的行列，用专业横幅展示您的职业价值'
              : 'Join 500K professionals showcasing their value with professional banners'}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {isZh ? '免费制作横幅' : 'Create Banner Free'}
            </Button>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Download className="h-4 w-4" />
              <span>{isZh ? '完美尺寸 · 无水印' : 'Perfect Size · No Watermark'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "LinkedIn Banner Maker",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />
    </div>
  )
}