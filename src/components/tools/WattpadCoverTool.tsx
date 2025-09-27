'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Sparkles, Palette, Download, Upload } from 'lucide-react'
import OutputGallery from '@/components/output-gallery'

// Wattpad genres with specific design styles
const wattpadGenres = [
  { value: 'romance', label: 'Romance', description: 'Soft colors, romantic imagery' },
  { value: 'fantasy', label: 'Fantasy', description: 'Magical elements, mystical atmospheres' },
  { value: 'teen-fiction', label: 'Teen Fiction', description: 'Vibrant, youthful designs' },
  { value: 'mystery', label: 'Mystery/Thriller', description: 'Dark, suspenseful aesthetics' },
  { value: 'fanfiction', label: 'Fanfiction', description: 'Character-focused, fandom styles' },
  { value: 'werewolf', label: 'Werewolf', description: 'Moon imagery, supernatural themes' },
  { value: 'vampire', label: 'Vampire', description: 'Gothic, dark romantic styles' },
  { value: 'sci-fi', label: 'Science Fiction', description: 'Futuristic, tech-inspired designs' },
  { value: 'historical', label: 'Historical Fiction', description: 'Period-appropriate aesthetics' },
  { value: 'poetry', label: 'Poetry', description: 'Artistic, emotional visuals' },
  { value: 'short-story', label: 'Short Story', description: 'Concise, impactful imagery' },
  { value: 'humor', label: 'Humor', description: 'Fun, lighthearted designs' },
  { value: 'non-fiction', label: 'Non-Fiction', description: 'Clean, informative layouts' },
  { value: 'spiritual', label: 'Spiritual', description: 'Peaceful, inspirational themes' },
  { value: 'lgbtq', label: 'LGBTQ+', description: 'Inclusive, pride-themed designs' },
  { value: 'adventure', label: 'Adventure', description: 'Dynamic, action-packed visuals' },
  { value: 'horror', label: 'Horror', description: 'Scary, unsettling imagery' },
  { value: 'paranormal', label: 'Paranormal', description: 'Supernatural, mysterious elements' },
  { value: 'chick-lit', label: 'ChickLit', description: 'Fun, feminine aesthetics' },
  { value: 'general', label: 'General Fiction', description: 'Versatile, balanced designs' }
]

// Design styles
const designStyles = [
  { value: 'photorealistic', label: 'Photorealistic', description: 'Realistic character designs' },
  { value: 'illustrated', label: 'Illustrated', description: 'Hand-drawn artistic style' },
  { value: 'minimalist', label: 'Minimalist', description: 'Clean, simple designs' },
  { value: 'dramatic', label: 'Dramatic', description: 'Bold, high-contrast visuals' },
  { value: 'dreamy', label: 'Dreamy', description: 'Soft, ethereal atmosphere' },
  { value: 'vintage', label: 'Vintage', description: 'Retro-inspired aesthetics' },
  { value: 'modern', label: 'Modern', description: 'Contemporary, trendy designs' },
  { value: 'dark', label: 'Dark', description: 'Moody, atmospheric style' }
]

export default function WattpadCoverTool() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    style: '',
    description: '',
    characterImage: null as File | null,
  })

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // Mock generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock images for demonstration
      const mockImages = [
        '/api/placeholder/512/800',
        '/api/placeholder/512/800',
        '/api/placeholder/512/800',
        '/api/placeholder/512/800',
      ]
      
      setGeneratedImages(mockImages)
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const isFormValid = formData.title && formData.genre

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form Section */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Story Details
              </h3>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    Story Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter your story title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Keep it short for better visibility</p>
                </div>

                {/* Author */}
                <div>
                  <Label htmlFor="author" className="text-sm font-medium">
                    Author Name
                  </Label>
                  <Input
                    id="author"
                    placeholder="By [Your Name]"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Genre */}
                <div>
                  <Label htmlFor="genre" className="text-sm font-medium">
                    Story Genre *
                  </Label>
                  <Select value={formData.genre} onValueChange={(value) => handleInputChange('genre', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your story genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {wattpadGenres.map(genre => (
                        <SelectItem key={genre.value} value={genre.value}>
                          <div>
                            <div className="font-medium">{genre.label}</div>
                            <div className="text-xs text-gray-500">{genre.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Design Options
              </h3>
              
              <div className="space-y-4">
                {/* Style */}
                <div>
                  <Label htmlFor="style" className="text-sm font-medium">
                    Visual Style
                  </Label>
                  <Select value={formData.style} onValueChange={(value) => handleInputChange('style', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a design style" />
                    </SelectTrigger>
                    <SelectContent>
                      {designStyles.map(style => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs text-gray-500">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Story Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your story's mood, main characters, or key themes..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1 min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Help the AI understand your story's essence</p>
                </div>

                {/* Character Upload */}
                <div>
                  <Label htmlFor="character" className="text-sm font-medium">
                    Character Image (Optional)
                  </Label>
                  <div className="mt-1">
                    <label htmlFor="character-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-600 transition-colors">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Upload character image or logo
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                      <input
                        id="character-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleInputChange('characterImage', file)
                        }}
                      />
                    </label>
                    {formData.characterImage && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {formData.characterImage.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!isFormValid || isGenerating}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Your Cover...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Wattpad Cover
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="h-full flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardContent className="pt-6 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Download className="w-5 h-5 text-purple-600" />
                Generated Covers
              </h3>
              
              <div className="flex-1 flex items-center">
                {generatedImages.length > 0 ? (
                  <OutputGallery outputs={generatedImages} />
                ) : (
                  <div className="w-full aspect-[512/800] bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200">
                    <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">Your covers will appear here</p>
                    <p className="text-xs mt-1">512×800px • Perfect for Wattpad</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}