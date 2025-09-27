'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Lightbulb, 
  TrendingUp, 
  Youtube,
  Eye,
  MousePointer,
  Zap,
  Palette,
  ArrowRight,
  Star,
  CheckCircle2,
  Play
} from 'lucide-react'

interface YouTubeThumbnailIdeasClientProps {
  locale: string
  translations: any
}

export default function YouTubeThumbnailIdeasClient({ locale, translations }: YouTubeThumbnailIdeasClientProps) {
  const isZh = locale === 'zh'
  const [selectedCategory, setSelectedCategory] = useState('all')

  const thumbnailIdeas = {
    gaming: [
      {
        title: isZh ? '史诗时刻高亮' : 'Epic Moment Highlights',
        description: isZh ? '捕捉游戏中最激动人心的瞬间，添加动态效果和火焰特效' : 'Capture the most exciting gaming moments with dynamic effects and flame graphics',
        ctr: '12-15%',
        example: isZh ? '大字标题 + 震惊表情 + 爆炸背景' : 'Bold text + shocked face + explosion background'
      },
      {
        title: isZh ? '前后对比' : 'Before/After Comparison',
        description: isZh ? '展示游戏技能或装备升级的明显变化' : 'Show dramatic improvements in skills or gear upgrades',
        ctr: '10-12%',
        example: isZh ? '分屏对比 + 箭头指示 + 数据展示' : 'Split screen + arrows + stats display'
      }
    ],
    vlog: [
      {
        title: isZh ? '情绪化表情' : 'Emotional Expressions',
        description: isZh ? '使用夸张的面部表情传达视频情绪' : 'Use exaggerated facial expressions to convey video emotions',
        ctr: '8-10%',
        example: isZh ? '特写表情 + 简洁标题 + 明亮色彩' : 'Close-up face + minimal text + bright colors'
      },
      {
        title: isZh ? '生活方式展示' : 'Lifestyle Showcase',
        description: isZh ? '展示理想生活场景，激发观众向往' : 'Display aspirational lifestyle scenes that viewers desire',
        ctr: '9-11%',
        example: isZh ? '美景背景 + 人物剪影 + 梦幻滤镜' : 'Beautiful scenery + silhouette + dreamy filter'
      }
    ],
    tutorial: [
      {
        title: isZh ? '步骤数字标注' : 'Numbered Steps',
        description: isZh ? '清晰显示教程步骤数量，让观众知道学习难度' : 'Clearly show tutorial steps so viewers know the complexity',
        ctr: '11-13%',
        example: isZh ? '"5步完成" + 成品展示 + 工具图标' : '"5 Steps" + final result + tool icons'
      },
      {
        title: isZh ? '问题解决式' : 'Problem-Solution Format',
        description: isZh ? '展示常见问题和解决方案的视觉对比' : 'Show visual contrast between common problems and solutions',
        ctr: '10-12%',
        example: isZh ? '红叉错误 + 绿勾正确 + 醒目箭头' : 'Red X wrong + green check right + bold arrows'
      }
    ],
    entertainment: [
      {
        title: isZh ? '悬念制造' : 'Mystery & Suspense',
        description: isZh ? '使用问号、模糊元素创造好奇心' : 'Use question marks and blurred elements to create curiosity',
        ctr: '13-16%',
        example: isZh ? '模糊关键部分 + "你绝对想不到" + 震惊元素' : 'Blur key parts + "You won\'t believe" + shock elements'
      },
      {
        title: isZh ? '名人/热点结合' : 'Celebrity/Trending Topics',
        description: isZh ? '结合当前热门话题或名人增加关注度' : 'Combine current trends or celebrities to boost attention',
        ctr: '14-17%',
        example: isZh ? '名人形象 + 热门话题 + 对比元素' : 'Celebrity image + trending topic + comparison elements'
      }
    ]
  }

  const designPrinciples = [
    {
      icon: <Eye className="h-6 w-6" />,
      title: isZh ? '高对比度' : 'High Contrast',
      description: isZh 
        ? '使用明暗对比让缩略图在推荐列表中脱颖而出' 
        : 'Use light/dark contrast to make thumbnails pop in feed'
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: isZh ? '三色原则' : 'Three Color Rule',
      description: isZh 
        ? '限制使用3种主要颜色，保持视觉简洁有力' 
        : 'Limit to 3 main colors for clean, powerful visuals'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: isZh ? '动态元素' : 'Dynamic Elements',
      description: isZh 
        ? '添加箭头、爆炸等元素暗示视频内容精彩' 
        : 'Add arrows, explosions to suggest exciting content'
    },
    {
      icon: <MousePointer className="h-6 w-6" />,
      title: isZh ? '关键信息突出' : 'Key Info Focus',
      description: isZh 
        ? '确保主要信息在手机小屏幕上也清晰可见' 
        : 'Ensure main message is clear even on small mobile screens'
    }
  ]

  const categories = [
    { id: 'all', name: isZh ? '全部' : 'All' },
    { id: 'gaming', name: isZh ? '游戏' : 'Gaming' },
    { id: 'vlog', name: isZh ? 'Vlog' : 'Vlog' },
    { id: 'tutorial', name: isZh ? '教程' : 'Tutorial' },
    { id: 'entertainment', name: isZh ? '娱乐' : 'Entertainment' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <Badge className="mb-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
              <TrendingUp className="mr-1 h-3 w-3" />
              {isZh ? 'KD: 22 - 低竞争关键词' : 'KD: 22 - Low Competition'}
            </Badge>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              {isZh ? 'YouTube 缩略图创意灵感库' : 'YouTube Thumbnail Ideas Gallery'}
            </h1>
            
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
              {isZh 
                ? '探索经过验证的缩略图设计策略，学习如何创建点击率超过 10% 的吸睛缩略图。'
                : 'Explore proven thumbnail design strategies and learn how to create thumbnails with CTR over 10%.'}
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                <Lightbulb className="mr-2 h-5 w-5" />
                {isZh ? '获取灵感模板' : 'Get Inspiration Templates'}
              </Button>
              <Button size="lg" variant="outline">
                <Play className="mr-2 h-5 w-5" />
                {isZh ? '观看设计教程' : 'Watch Design Tutorial'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? 'YouTube 缩略图设计黄金法则' : 'YouTube Thumbnail Design Golden Rules'}
          </h2>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {designPrinciples.map((principle, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400">
                    {principle.icon}
                  </div>
                  <CardTitle className="text-lg">{principle.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{principle.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ideas by Category */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isZh ? '分类缩略图创意' : 'Thumbnail Ideas by Category'}
          </h2>
          <p className="mb-12 text-center text-lg text-gray-600 dark:text-gray-300">
            {isZh 
              ? '根据您的内容类型选择最适合的缩略图风格'
              : 'Choose the best thumbnail style based on your content type'}
          </p>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-5 mb-8">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(thumbnailIdeas).map(([categoryId, ideas]) => (
              <TabsContent key={categoryId} value={categoryId} className="space-y-6">
                {ideas.map((idea, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2">{idea.title}</CardTitle>
                          <CardDescription className="text-base">{idea.description}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          CTR: {idea.ctr}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {isZh ? '示例：' : 'Example:'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">{idea.example}</p>
                      </div>
                      <Button className="mt-4 w-full" variant="outline">
                        {isZh ? '使用此创意模板' : 'Use This Template'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
            
            <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(thumbnailIdeas).flatMap(([category, ideas]) =>
                ideas.map((idea, index) => (
                  <Card key={`${category}-${index}`} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Badge className="w-fit mb-2">{categories.find(c => c.id === category)?.name}</Badge>
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                      <CardDescription>{idea.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 font-medium">CTR: {idea.ctr}</span>
                        <Button size="sm" variant="ghost">
                          {isZh ? '查看详情' : 'View Details'}
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-gradient-to-r from-red-600 to-red-700 p-8 md:p-12 text-white">
            <h2 className="mb-8 text-center text-3xl font-bold">
              {isZh ? '成功指标' : 'Success Metrics'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">10%+</div>
                <p className="text-red-100">{isZh ? '平均点击率' : 'Average CTR'}</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">3x</div>
                <p className="text-red-100">{isZh ? '观看时长增长' : 'Watch Time Increase'}</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">45%</div>
                <p className="text-red-100">{isZh ? '订阅转化率提升' : 'Subscriber Conversion'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Youtube className="mx-auto mb-6 h-16 w-16 text-red-600" />
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {isZh 
              ? '立即创建高点击率缩略图'
              : 'Create High-CTR Thumbnails Now'}
          </h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
            {isZh 
              ? '使用我们的 AI 工具，将这些创意转化为专业的 YouTube 缩略图'
              : 'Use our AI tools to turn these ideas into professional YouTube thumbnails'}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={`/${locale}/platforms/youtube`}>
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {isZh ? '开始制作缩略图' : 'Start Creating Thumbnails'}
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{isZh ? '已帮助 100万+ 创作者' : 'Helped 1M+ creators'}</span>
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
            "@type": "HowTo",
            "name": "How to Create High-CTR YouTube Thumbnails",
            "description": "Learn proven strategies for creating YouTube thumbnails that get clicks",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Choose high contrast colors",
                "text": "Use contrasting colors to make your thumbnail stand out"
              },
              {
                "@type": "HowToStep", 
                "name": "Add clear, bold text",
                "text": "Include readable text that complements your title"
              },
              {
                "@type": "HowToStep",
                "name": "Use expressive faces",
                "text": "Human faces with emotions increase click-through rates"
              }
            ]
          })
        }}
      />
    </div>
  )
}