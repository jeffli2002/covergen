'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const animeStyles = [
  { value: 'shonen', label: 'Shonen Style', description: 'Bold, dynamic action scenes' },
  { value: 'shoujo', label: 'Shoujo Style', description: 'Romantic, soft aesthetics' },
  { value: 'seinen', label: 'Seinen Style', description: 'Mature, detailed artwork' },
  { value: 'chibi', label: 'Chibi Style', description: 'Cute, super-deformed characters' },
  { value: 'mecha', label: 'Mecha Style', description: 'Robots and futuristic themes' },
  { value: 'fantasy', label: 'Fantasy Style', description: 'Magical and mythical elements' },
]

const colorSchemes = [
  { value: 'vibrant', label: 'Vibrant Colors', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'] },
  { value: 'pastel', label: 'Pastel Dreams', colors: ['#FFDAB9', '#E6E6FA', '#98D8C8'] },
  { value: 'dark', label: 'Dark & Moody', colors: ['#2C3E50', '#E74C3C', '#8E44AD'] },
  { value: 'neon', label: 'Neon Lights', colors: ['#FF006E', '#FB5607', '#FFBE0B'] },
  { value: 'sunset', label: 'Sunset Vibes', colors: ['#FF7F50', '#FF6347', '#FFD700'] },
]

export default function AnimePosterTool() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState('shonen')
  const [colorScheme, setColorScheme] = useState('vibrant')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!title.trim()) return
    
    setIsGenerating(true)
    setGeneratedImages([]) // Clear previous results
    
    try {
      // Build the anime-specific prompt
      const animePrompt = `Anime poster in ${animeStyles.find(s => s.value === style)?.label} style, ${colorSchemes.find(c => c.value === colorScheme)?.label} color scheme. Title: "${title}". ${description ? `Description: ${description}` : ''} High quality anime art, detailed illustration, Japanese manga style.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: animePrompt,
          mode: 'text',
          style: 'anime', // Use anime style
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
      // Handle error appropriately
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
      a.download = `anime-poster-${Date.now()}.png`
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Anime Poster Maker
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create stunning anime-style posters with AI. Perfect for manga covers, anime fan art, and Japanese-style designs.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Design Your Poster</h2>
            
            <div className="space-y-4">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title">Anime Title</Label>
                <Input
                  id="title"
                  placeholder="Enter your anime title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the scene, characters, or mood..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Style Selection */}
              <div className="space-y-2">
                <Label htmlFor="style">Art Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {animeStyles.map((s) => (
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

              {/* Color Scheme */}
              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <div className="grid grid-cols-2 gap-2">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.value}
                      onClick={() => setColorScheme(scheme.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        colorScheme === scheme.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-1">
                          {scheme.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm font-medium">{scheme.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!title || isGenerating}
                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Anime Poster
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Pro Tips:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Use Japanese words for more authentic results</li>
              <li>• Mention specific anime references for style inspiration</li>
              <li>• Describe character emotions for expressive art</li>
              <li>• Add "kawaii" for cute elements</li>
            </ul>
          </div>
        </Card>

        {/* Preview Section */}
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
  )
}

export default AnimePosterTool