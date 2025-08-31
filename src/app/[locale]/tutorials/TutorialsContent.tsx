'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, 
  Image, 
  Target, 
  Palette, 
  TrendingUp, 
  BookOpen,
  Play,
  Clock,
  Star,
  Users
} from 'lucide-react'

const tutorialCategories = [
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering',
    icon: Lightbulb,
    description: 'Learn how to write effective prompts for better AI generation',
    tutorials: [
      {
        title: 'Writing Clear and Specific Prompts',
        description: 'Learn the art of crafting prompts that give AI clear direction for your cover designs.',
        duration: '5 min read',
        difficulty: 'Beginner',
        tags: ['Basics', 'Prompts', 'AI Tips'],
        content: 'Start with a clear subject, add style preferences, and specify mood or atmosphere.'
      },
      {
        title: 'Using Reference Images Effectively',
        description: 'Maximize the impact of your reference images to maintain brand consistency.',
        duration: '7 min read',
        difficulty: 'Intermediate',
        tags: ['Reference Images', 'Branding', 'Consistency'],
        content: 'Choose reference images that represent your brand colors, style, and aesthetic.'
      }
    ]
  },
  {
    id: 'platform-optimization',
    title: 'Platform Optimization',
    icon: Target,
    description: 'Optimize your covers for different social media platforms',
    tutorials: [
      {
        title: 'YouTube Thumbnail Best Practices',
        description: 'Create click-worthy thumbnails that drive views and engagement.',
        duration: '8 min read',
        difficulty: 'Intermediate',
        tags: ['YouTube', 'Thumbnails', 'Engagement'],
        content: 'Use bright colors, clear text, expressive faces, and avoid cluttered designs.'
      }
    ]
  }
]

export default function TutorialsContent() {
  const [activeCategory, setActiveCategory] = useState('prompt-engineering')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              AI Generation Tips
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Master the art of AI-powered cover generation with expert tips and tutorials
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              {tutorialCategories.map((category) => {
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
            <div className="space-y-8">
              {tutorialCategories
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
                      {category.tutorials.map((tutorial, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                              <Badge className="bg-green-100 text-green-800">
                                {tutorial.difficulty}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">{tutorial.description}</p>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4">
                              <p className="text-sm leading-relaxed">{tutorial.content}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {tutorial.duration}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {tutorial.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}