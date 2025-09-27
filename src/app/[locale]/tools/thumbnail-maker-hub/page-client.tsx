'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Sparkles, Youtube, Music, BookOpen, Gamepad2, Radio, Users, Palette, TrendingUp, Zap, Crown, Filter, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  locale: string
  translations: any
}

interface Tool {
  id: string
  name: string
  description: string
  icon: JSX.Element
  category: string
  keywords: string[]
  kd?: number
  searchVolume?: string
  trending?: boolean
}

export default function ThumbnailMakerHubClient({ locale, translations }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const tools: Tool[] = [
    // Social Media Tools
    {
      id: 'instagram-thumbnail-maker',
      name: 'Instagram Thumbnail Maker',
      description: 'Create perfect square thumbnails for Instagram posts, reels, and IGTV',
      icon: <Grid className="w-6 h-6" />,
      category: 'social-media',
      keywords: ['instagram thumbnail maker', 'instagram grid maker', 'instagram highlight cover maker'],
      kd: 10,
      searchVolume: '50/mo',
      trending: true,
    },
    {
      id: 'linkedin-banner-maker',
      name: 'LinkedIn Banner Maker',
      description: 'Professional banner creation for LinkedIn profiles and company pages',
      icon: <Users className="w-6 h-6" />,
      category: 'social-media',
      keywords: ['linkedin banner maker', 'professional cover generator'],
      kd: 7,
      searchVolume: '880/mo',
    },
    {
      id: 'facebook-event-cover',
      name: 'Facebook Event Cover Maker',
      description: 'Design eye-catching covers for Facebook events and pages',
      icon: <Users className="w-6 h-6" />,
      category: 'social-media',
      keywords: ['facebook event cover', 'fall facebook covers', 'how to make facebook post shareable'],
      kd: 14,
      searchVolume: '2,400/mo',
    },
    
    // Music & Audio Tools
    {
      id: 'spotify-playlist-cover',
      name: 'Spotify Playlist Cover Maker',
      description: 'Create stunning 300x300 covers for your Spotify playlists',
      icon: <Music className="w-6 h-6" />,
      category: 'music',
      keywords: ['spotify playlist cover', 'spotify canvas maker', 'mixtape cover generator'],
      kd: 44,
      searchVolume: '14,800/mo',
    },
    {
      id: 'music-album-cover',
      name: 'Album Cover Generator',
      description: 'AI-powered album art creation for musicians and bands',
      icon: <Music className="w-6 h-6" />,
      category: 'music',
      keywords: ['album art generator', 'ai album art generator', 'cd cover dimensions'],
      kd: 24,
      searchVolume: '210/mo',
      trending: true,
    },
    {
      id: 'podcast-cover-maker',
      name: 'Podcast Cover Maker',
      description: 'Professional 3000x3000 podcast covers for all platforms',
      icon: <Radio className="w-6 h-6" />,
      category: 'music',
      keywords: ['podcast cover maker', 'podcast cover art maker'],
      kd: 23,
      searchVolume: '30/mo',
      trending: true,
    },
    
    // Gaming Tools
    {
      id: 'game-cover-art',
      name: 'Gaming Thumbnail Maker',
      description: 'Epic game covers for Steam, YouTube gaming, and streams',
      icon: <Gamepad2 className="w-6 h-6" />,
      category: 'gaming',
      keywords: ['gaming thumbnail maker', 'fortnite thumbnail', 'minecraft thumbnail'],
      kd: 19,
      searchVolume: '3,600/mo',
    },
    
    // Publishing Tools
    {
      id: 'book-cover-creator',
      name: 'Book Cover Creator',
      description: 'Professional book covers for authors and self-publishers',
      icon: <BookOpen className="w-6 h-6" />,
      category: 'publishing',
      keywords: ['book cover creator', 'ai book cover generator', 'fantasy book covers'],
      kd: 30,
      searchVolume: '590/mo',
    },
    {
      id: 'wattpad-cover-maker',
      name: 'Wattpad Cover Maker',
      description: 'Perfect 512x800 covers for your Wattpad stories',
      icon: <BookOpen className="w-6 h-6" />,
      category: 'publishing',
      keywords: ['wattpad cover maker'],
      kd: 8,
      searchVolume: '1,900/mo',
      trending: true,
    },
    
    // Creative Tools
    {
      id: 'anime-poster-maker',
      name: 'Anime Poster Maker',
      description: 'Create stunning anime-style posters and manga covers',
      icon: <Sparkles className="w-6 h-6" />,
      category: 'creative',
      keywords: ['anime poster maker', 'manga cover maker'],
      kd: 5,
      searchVolume: '20/mo',
    },
    {
      id: 'discord-banner-maker',
      name: 'Discord Banner Maker',
      description: 'Professional banners for Discord servers and profiles',
      icon: <Crown className="w-6 h-6" />,
      category: 'social-media',
      keywords: ['discord banner maker', 'discord server banner maker'],
      kd: 10,
      searchVolume: '1,200/mo',
    },
    
    // Event Tools
    {
      id: 'event-poster-designer',
      name: 'Event Poster Designer',
      description: 'Create posters for concerts, festivals, and events',
      icon: <Palette className="w-6 h-6" />,
      category: 'events',
      keywords: ['event poster designer', 'halloween poster creator', 'birthday poster maker'],
      kd: 22,
      searchVolume: '170/mo',
    },
    {
      id: 'webinar-poster-maker',
      name: 'Webinar Poster Maker',
      description: 'Professional graphics for webinars and online events',
      icon: <TrendingUp className="w-6 h-6" />,
      category: 'events',
      keywords: ['webinar poster maker', 'online event cover'],
      kd: 29,
      searchVolume: '20/mo',
    },
  ]

  const categories = [
    { id: 'all', name: 'All Tools', icon: <Grid className="w-4 h-4" /> },
    { id: 'social-media', name: 'Social Media', icon: <Users className="w-4 h-4" /> },
    { id: 'music', name: 'Music & Audio', icon: <Music className="w-4 h-4" /> },
    { id: 'gaming', name: 'Gaming', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'publishing', name: 'Publishing', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'creative', name: 'Creative', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'events', name: 'Events', icon: <Palette className="w-4 h-4" /> },
    { id: 'ai-tools', name: 'AI Tools', icon: <Zap className="w-4 h-4" /> },
  ]

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const popularSearches = [
    'youtube thumbnail size', 'thumbnail maker no watermark', 'fortnite thumbnail',
    'ai thumbnail generator', 'spotify playlist cover', 'discord banner',
    'wattpad cover maker', 'podcast cover', 'gaming thumbnail'
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold mb-6">
              All-in-One Thumbnail & Cover Maker Hub
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Discover the perfect AI tool for creating thumbnails, covers, and banners. 
              Free tools with no watermarks for every platform.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search tools... (e.g., youtube thumbnail, spotify cover, wattpad)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 w-full text-black"
              />
            </div>
            
            {/* Popular Searches */}
            <div className="flex flex-wrap gap-2 justify-center">
              {popularSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => setSearchQuery(search)}
                  className="text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Filters and View Toggle */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-gray-600 mb-6">
              Showing {filteredTools.length} tools {selectedCategory !== 'all' && `in ${categories.find(c => c.id === selectedCategory)?.name}`}
            </p>

            {/* Tools Grid/List */}
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/${locale}/tools/${tool.id}`}
                  className={`block ${
                    viewMode === 'grid'
                      ? 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6'
                      : 'bg-white rounded-lg shadow hover:shadow-md transition-all p-4 flex items-center gap-4'
                  }`}
                >
                  <div className={viewMode === 'grid' ? '' : 'flex items-center gap-4 flex-1'}>
                    <div className={`${
                      viewMode === 'grid'
                        ? 'w-12 h-12 mb-4'
                        : 'w-10 h-10 flex-shrink-0'
                    } bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white`}>
                      {tool.icon}
                    </div>
                    
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <h3 className={`${viewMode === 'grid' ? 'text-xl mb-2' : 'text-lg'} font-semibold flex items-center gap-2`}>
                        {tool.name}
                        {tool.trending && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Trending</span>
                        )}
                      </h3>
                      
                      <p className={`text-gray-600 ${viewMode === 'grid' ? 'mb-4' : 'text-sm'}`}>
                        {tool.description}
                      </p>
                      
                    </div>
                  </div>
                  
                  <div className={viewMode === 'list' ? 'flex items-center gap-4' : ''}>
                    <Button variant="outline" size="sm" className={viewMode === 'grid' ? 'w-full' : ''}>
                      Use Tool →
                    </Button>
                  </div>
                </Link>
              ))}
            </div>

            {/* SEO Content Sections */}
            <div className="mt-20 space-y-16">
              {/* Thumbnail Maker Guide */}
              <section className="bg-gray-50 rounded-2xl p-12">
                <h2 className="text-3xl font-bold mb-8">Complete Guide to Thumbnail & Cover Makers</h2>
                
                <div className="prose max-w-none text-gray-700">
                  <p className="text-lg mb-6">
                    Whether you need a <strong>YouTube thumbnail maker</strong>, <strong>Spotify playlist cover</strong>, 
                    or <strong>Wattpad cover maker</strong>, our AI-powered tools have you covered. Each tool is 
                    optimized for its specific platform with perfect dimensions and style guidelines.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Popular Thumbnail Tools</h3>
                      <ul className="space-y-2">
                        <li>• <strong>YouTube Thumbnail Size</strong>: 1280x720 pixels for maximum impact</li>
                        <li>• <strong>Thumbnail Tester</strong>: Preview how your thumbnails look in search</li>
                        <li>• <strong>Thumbnail Grabber</strong>: Download and analyze competitor thumbnails</li>
                        <li>• <strong>Gaming Thumbnails</strong>: Fortnite, Minecraft, and more game-specific designs</li>
                        <li>• <strong>Thumbnail Maker No Watermark</strong>: All our tools are 100% watermark-free</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Specialized Cover Makers</h3>
                      <ul className="space-y-2">
                        <li>• <strong>Album Art Generator</strong>: Perfect for musicians and DJs</li>
                        <li>• <strong>Book Cover Creator</strong>: For authors and self-publishers</li>
                        <li>• <strong>Discord Banner Maker</strong>: Server and profile banners</li>
                        <li>• <strong>LinkedIn Banner Maker</strong>: Professional headers for networking</li>
                        <li>• <strong>Podcast Cover Maker</strong>: 3000x3000 covers for all platforms</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Technology Section */}
              <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12">
                <h2 className="text-3xl font-bold mb-8">AI-Powered Cover Generation Technology</h2>
                
                <div className="prose max-w-none text-gray-700">
                  <p className="text-lg mb-6">
                    Our <strong>AI thumbnail generator</strong> uses advanced machine learning to create 
                    stunning visuals. Unlike traditional tools, our <strong>AI album art generator</strong> and 
                    other AI tools understand context, style, and platform requirements automatically.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="text-lg font-semibold mb-3">AI Image Generation</h3>
                      <p className="text-sm">
                        Create unique thumbnails and covers with AI that understands your content and audience.
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="text-lg font-semibold mb-3">Smart Sizing</h3>
                      <p className="text-sm">
                        Automatic optimization for YouTube thumbnail size, CD cover dimensions, and more.
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="text-lg font-semibold mb-3">Style Learning</h3>
                      <p className="text-sm">
                        AI learns from best album covers of all time and trending design patterns.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Platform-Specific Guidelines */}
              <section className="bg-white rounded-2xl shadow-xl p-12">
                <h2 className="text-3xl font-bold mb-8">Platform-Specific Requirements</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Platform</th>
                        <th className="text-left py-3 px-4">Recommended Size</th>
                        <th className="text-left py-3 px-4">File Format</th>
                        <th className="text-left py-3 px-4">Special Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4"><strong>YouTube Thumbnail</strong></td>
                        <td className="py-3 px-4">1280x720</td>
                        <td className="py-3 px-4">JPG, PNG</td>
                        <td className="py-3 px-4">Use thumbnail tester for CTR optimization</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4"><strong>TikTok Thumbnail</strong></td>
                        <td className="py-3 px-4">1080x1920</td>
                        <td className="py-3 px-4">JPG, PNG</td>
                        <td className="py-3 px-4">Vertical format, eye-catching first frame</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4"><strong>Spotify Playlist</strong></td>
                        <td className="py-3 px-4">300x300</td>
                        <td className="py-3 px-4">JPG, PNG</td>
                        <td className="py-3 px-4">Also works for Apple Music</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4"><strong>Discord Banner</strong></td>
                        <td className="py-3 px-4">960x540</td>
                        <td className="py-3 px-4">JPG, PNG, GIF</td>
                        <td className="py-3 px-4">Server banner for Nitro boosted servers</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4"><strong>LinkedIn Banner</strong></td>
                        <td className="py-3 px-4">1584x396</td>
                        <td className="py-3 px-4">JPG, PNG</td>
                        <td className="py-3 px-4">Professional appearance crucial</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4"><strong>Wattpad Cover</strong></td>
                        <td className="py-3 px-4">512x800</td>
                        <td className="py-3 px-4">JPG, PNG</td>
                        <td className="py-3 px-4">Popular for story writers</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section bg-gradient-to-br from-blue-600 to-purple-700 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Start Creating Professional Thumbnails & Covers Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join millions using our AI-powered tools. No watermarks, no signup required, 
            and perfect dimensions for every platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-white hover:bg-white/10"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Browse All Tools
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}