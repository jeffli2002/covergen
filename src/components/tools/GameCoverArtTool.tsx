'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Gamepad2, Swords, Trophy, Zap } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const gamePlatforms = [
  { 
    value: 'youtube-gaming', 
    label: 'YouTube Gaming Thumbnail', 
    size: '1280x720',
    keywords: ['gaming youtube thumbnail', 'youtube gaming cover'],
    popular: true
  },
  { 
    value: 'twitch-stream', 
    label: 'Twitch Stream Thumbnail', 
    size: '1920x1080',
    keywords: ['twitch stream thumbnail', 'twitch cover art']
  },
  { 
    value: 'steam-cover', 
    label: 'Steam Store Cover', 
    size: '616x353',
    keywords: ['steam game cover maker', 'steam store art']
  },
  { 
    value: 'epic-games', 
    label: 'Epic Games Cover', 
    size: '1920x1080',
    keywords: ['epic games cover', 'epic store thumbnail']
  },
  { 
    value: 'game-box', 
    label: 'Game Box Art', 
    size: '1526x2160',
    keywords: ['game box art maker', 'video game cover generator']
  },
  { 
    value: 'discord-game', 
    label: 'Discord Game Banner', 
    size: '960x540',
    keywords: ['discord game banner', 'discord server gaming']
  },
]

const gameGenres = [
  { value: 'minecraft', label: 'Minecraft', keywords: ['minecraft thumbnail creator no watermark'], trending: true },
  { value: 'fortnite', label: 'Fortnite', keywords: ['fortnite cover image generator'], trending: true },
  { value: 'roblox', label: 'Roblox', keywords: ['roblox thumbnail maker ai'], trending: true },
  { value: 'fps', label: 'FPS/Shooter', keywords: ['fps thumbnail maker', 'shooter game cover'] },
  { value: 'moba', label: 'MOBA', keywords: ['moba cover creator', 'league thumbnail'] },
  { value: 'rpg', label: 'RPG', keywords: ['rpg game cover', 'fantasy game art'] },
  { value: 'racing', label: 'Racing', keywords: ['racing game cover', 'car game thumbnail'] },
  { value: 'sports', label: 'Sports', keywords: ['sports game cover', 'fifa thumbnail'] },
  { value: 'horror', label: 'Horror', keywords: ['horror game cover', 'scary game thumbnail'] },
  { value: 'indie', label: 'Indie', keywords: ['indie game cover', 'pixel art thumbnail'] },
]

const stylePresets = [
  { value: 'epic', label: 'Epic & Cinematic', description: 'Hollywood-style dramatic covers' },
  { value: 'neon', label: 'Neon Cyberpunk', description: 'Futuristic neon aesthetics' },
  { value: 'cartoon', label: 'Cartoon Style', description: 'Colorful animated look' },
  { value: 'realistic', label: 'Photorealistic', description: 'Ultra-realistic graphics' },
  { value: 'retro', label: 'Retro Gaming', description: '8-bit and vintage style' },
  { value: 'minimal', label: 'Minimal Modern', description: 'Clean gaming aesthetics' },
]

const effectOptions = [
  { value: 'explosion', label: 'Explosions', icon: Zap },
  { value: 'fire', label: 'Fire Effects', icon: Zap },
  { value: 'lightning', label: 'Lightning', icon: Zap },
  { value: 'smoke', label: 'Smoke', icon: Zap },
  { value: 'glitch', label: 'Glitch Effect', icon: Zap },
  { value: 'particles', label: 'Particles', icon: Zap },
]

export default function GameCoverArtTool() {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [platform, setPlatform] = useState('youtube-gaming')
  const [genre, setGenre] = useState('minecraft')
  const [style, setStyle] = useState('epic')
  const [selectedEffects, setSelectedEffects] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const selectedPlatform = gamePlatforms.find(p => p.value === platform)

  const toggleEffect = (effect: string) => {
    setSelectedEffects(prev => 
      prev.includes(effect) 
        ? prev.filter(e => e !== effect)
        : [...prev, effect]
    )
  }

  const handleGenerate = async () => {
    if (!title.trim()) return
    
    setIsGenerating(true)
    setGeneratedImages([]) // Clear previous results
    
    try {
      // Build the game-specific prompt
      const gamePrompt = `Game cover art for ${gameGenres.find(g => g.value === genre)?.label} game. Title: "${title}". ${subtitle ? `Subtitle: ${subtitle}.` : ''} Platform: ${selectedPlatform?.label}. Style: ${stylePresets.find(s => s.value === style)?.label}. ${selectedEffects.length > 0 ? `Effects: ${selectedEffects.join(', ')}.` : ''} ${description ? `Description: ${description}` : ''} Professional high-quality gaming cover art.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: gamePrompt,
          mode: 'text',
          style: style || 'modern',
          platform: 'none', // No specific platform dimensions
        }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      
      // Set only the first image from the response
      if (data.images && data.images.length > 0) {
        setGeneratedImages([data.images[0]])
      }
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    setDownloadingId(`image_${index}`)
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `game-cover-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleGenerateNew = () => {
    setGeneratedImages([])
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Game Cover Art Generator
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Create epic gaming thumbnails and covers for YouTube, Twitch, Steam, and more. 
          AI-powered gaming art generator for Minecraft, Fortnite, Roblox, and all game genres.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Free Gaming Thumbnails
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            No Watermark
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            4K Quality
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-green-600" />
              Design Your Game Cover
            </h2>
            
            <div className="space-y-4">
              {/* Game Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Game Title / Channel Name *</Label>
                <Input
                  id="title"
                  placeholder="Enter game or video title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-bold"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle / Episode (Optional)</Label>
                <Input
                  id="subtitle"
                  placeholder="Episode 1, Season 2, etc..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gamePlatforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{p.label}</span>
                          <span className="text-xs text-gray-500 ml-2">{p.size}</span>
                          {p.popular && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded ml-2">Popular</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlatform && (
                  <p className="text-sm text-gray-500">
                    Resolution: {selectedPlatform.size} pixels
                  </p>
                )}
              </div>

              {/* Game/Genre Selection */}
              <div className="space-y-2">
                <Label htmlFor="genre">Game Type</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger id="genre">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gameGenres.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        <div className="flex items-center gap-2">
                          <span>{g.label}</span>
                          {g.trending && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Trending</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Style Selection */}
              <div className="space-y-2">
                <Label htmlFor="style">Art Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stylePresets.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <div>
                          <div className="font-medium">{s.label}</div>
                          <div className="text-xs text-gray-500">{s.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Special Effects */}
              <div className="space-y-2">
                <Label>Special Effects</Label>
                <div className="grid grid-cols-3 gap-2">
                  {effectOptions.map((effect) => {
                    const Icon = effect.icon
                    const isSelected = selectedEffects.includes(effect.value)
                    return (
                      <button
                        key={effect.value}
                        onClick={() => toggleEffect(effect.value)}
                        className={`p-2 rounded-lg border-2 text-sm flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs">{effect.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Additional Details (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the scene, characters, or action..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!title || isGenerating}
                className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating Epic Cover Art...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Game Cover
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Gaming Tips */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-green-600" />
              Pro Gaming Tips:
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Use bright colors and high contrast for thumbnails</li>
              <li>• Add action elements to show gameplay excitement</li>
              <li>• Include your face for better engagement (YouTube)</li>
              <li>• Test different styles to see what gets more clicks</li>
            </ul>
          </div>
        </Card>

        {/* Preview Section */}
        <div className="space-y-6">
          <OutputGallery
            generatedImages={generatedImages}
            downloadingId={downloadingId}
            onDownload={handleDownload}
            onGenerateNew={handleGenerateNew}
            isGenerating={isGenerating}
            platform="none"
          />
        </div>
      </div>
    </div>
  )
}

