'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  Calendar, 
  User, 
  Search, 
  Clock,
  Eye,
  Heart,
  Share2,
  ArrowRight,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const blogPosts = [
  {
    id: 1,
    title: 'How AI is Revolutionizing Content Creation in 2025',
    excerpt: 'Discover the latest trends in AI-powered content creation and how creators are leveraging these tools to scale their production.',
    author: 'Sarah Chen',
    date: '2025-01-15',
    readTime: '8 min read',
    category: 'AI Trends',
    views: 1247,
    likes: 89,
    tags: ['AI', 'Content Creation', 'Trends', '2025']
  },
  {
    id: 2,
    title: '5 Proven Strategies for YouTube Thumbnail Success',
    excerpt: 'Learn the science behind high-performing YouTube thumbnails and how to apply these principles to your own content.',
    author: 'Mike Rodriguez',
    date: '2025-01-12',
    readTime: '12 min read',
    category: 'YouTube Tips',
    views: 2156,
    likes: 156,
    tags: ['YouTube', 'Thumbnails', 'Strategy', 'Growth']
  },
  {
    id: 3,
    title: 'Building Brand Consistency Across Multiple Platforms',
    excerpt: 'Maintain your unique brand identity while adapting to different social media platform requirements and audience expectations.',
    author: 'Emma Wilson',
    date: '2025-01-10',
    readTime: '10 min read',
    category: 'Branding',
    views: 1890,
    likes: 134,
    tags: ['Branding', 'Multi-platform', 'Consistency', 'Strategy']
  },
  {
    id: 4,
    title: 'The Psychology of Color in Cover Design',
    excerpt: 'Understand how different colors affect viewer psychology and engagement rates across various content platforms.',
    author: 'David Kim',
    date: '2025-01-08',
    readTime: '15 min read',
    category: 'Design',
    views: 1678,
    likes: 98,
    tags: ['Design', 'Color Theory', 'Psychology', 'Engagement']
  }
]

const categories = [
  { id: 'all', label: 'All Posts', count: 24 },
  { id: 'ai-trends', label: 'AI Trends', count: 8 },
  { id: 'youtube-tips', label: 'YouTube Tips', count: 6 },
  { id: 'branding', label: 'Branding', count: 5 },
  { id: 'design', label: 'Design', count: 5 }
]

export default function BlogContent() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [shareMenuOpen, setShareMenuOpen] = useState<number | null>(null)
  const [copiedPost, setCopiedPost] = useState<number | null>(null)

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'all' || 
                           post.category.toLowerCase().replace(' ', '-') === activeCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleReadMore = (postId: number) => {
    router.push(`/blog/${postId}`)
  }

  const handleShare = async (postId: number, platform: string) => {
    const post = blogPosts.find(p => p.id === postId)
    if (!post) return

    const url = `${window.location.origin}/blog/${postId}`
    const text = `Check out this article: ${post.title}`
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(url)
          setCopiedPost(postId)
          setTimeout(() => setCopiedPost(null), 2000)
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = url
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          setCopiedPost(postId)
          setTimeout(() => setCopiedPost(null), 2000)
        }
        break
    }
    setShareMenuOpen(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Creator Blog
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Insights, tips, and strategies to help you create better content and grow your audience
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
              placeholder="Search articles, topics, or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
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

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                </div>
                
                <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
                
                <p className="text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Post Meta */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setShareMenuOpen(shareMenuOpen === post.id ? null : post.id)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>

                      {shareMenuOpen === post.id && (
                        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-2 z-10 min-w-[160px]">
                          <button
                            onClick={() => handleShare(post.id, 'twitter')}
                            className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                          >
                            <Twitter className="w-4 h-4" />
                            Twitter
                          </button>
                          <button
                            onClick={() => handleShare(post.id, 'facebook')}
                            className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                          >
                            <Facebook className="w-4 h-4" />
                            Facebook
                          </button>
                          <button
                            onClick={() => handleShare(post.id, 'linkedin')}
                            className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                          >
                            <Linkedin className="w-4 h-4" />
                            LinkedIn
                          </button>
                          <button
                            onClick={() => handleShare(post.id, 'copy')}
                            className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                          >
                            {copiedPost === post.id ? (
                              <>
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-green-500">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy Link
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="group-hover:bg-primary transition-colors"
                      onClick={() => handleReadMore(post.id)}
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-800 dark:to-indigo-900 rounded-2xl p-8">
          <div className="text-center max-w-2xl mx-auto">
            <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Stay Updated with Creator Insights</h3>
            <p className="text-muted-foreground mb-6">
              Get the latest tips, trends, and strategies delivered to your inbox every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button className="bg-primary hover:bg-primary/90">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              No spam, unsubscribe at any time. Read our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {shareMenuOpen !== null && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShareMenuOpen(null)}
        />
      )}
    </div>
  )
}