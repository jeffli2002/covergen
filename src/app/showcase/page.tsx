'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Image, 
  Heart, 
  Download, 
  Share2, 
  Search, 
  Filter,
  Star,
  Eye,
  Users,
  Sparkles
} from 'lucide-react'

const showcaseCategories = [
  { id: 'all', label: 'All', count: 156 },
  { id: 'youtube', label: 'YouTube', count: 67 },
  { id: 'tiktok', label: 'TikTok', count: 43 },
  { id: 'spotify', label: 'Spotify', count: 28 },
  { id: 'bilibili', label: 'Bilibili', count: 18 }
]

const showcaseItems = [
  {
    id: 1,
    title: 'Tech Tutorial Series',
    creator: 'Alex Chen',
    platform: 'youtube',
    category: 'Technology',
    likes: 1247,
    views: 15600,
    tags: ['Tech', 'Tutorial', 'Programming'],
    description: 'A series of programming tutorials with consistent branding and engaging visuals.'
  },
  {
    id: 2,
    title: 'Fitness Motivation',
    creator: 'Sarah Johnson',
    platform: 'tiktok',
    category: 'Lifestyle',
    likes: 892,
    views: 8900,
    tags: ['Fitness', 'Motivation', 'Health'],
    description: 'Daily fitness motivation content with vibrant, energetic cover designs.'
  }
]

export default function ShowcasePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = showcaseItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.platform === activeCategory
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.creator.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Creator Gallery
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover amazing cover designs created by creators using CoverGen AI
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search creators, titles, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {showcaseCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Image className="w-16 h-16 text-gray-400 mx-auto mb-2" aria-hidden="true" />
                    <p className="text-sm text-gray-500">{item.title}</p>
                  </div>
                </div>
                
                {/* Platform Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-white/90 text-gray-800 hover:bg-white">
                    {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">by {item.creator}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {item.likes.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {item.views.toLocaleString()}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
