'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  X,
  ImageIcon,
  FileText,
  Sparkles,
  Maximize2,
  RefreshCw,
  Loader2,
  Info,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ImagePreviewModal from './image-preview-modal'
import { platformSizes, type Platform } from '@/lib/utils'
import { platformIcons, platformGuidelines, platformEnhancements, generatePlatformPrompt } from '@/lib/platform-configs'
import { preprocessImageForPlatform } from '@/lib/image-resizer'

interface InputPanelProps {
  // Mode state
  mode: 'image' | 'text'
  setMode: (mode: 'image' | 'text') => void
  
  // Image state
  referenceImages: File[]
  setReferenceImages: (images: File[]) => void
  
  // Prompt state
  title: string
  setTitle: (title: string) => void
  prompt: string
  setPrompt: (prompt: string) => void
  
  // Platform state
  platform: Platform
  setPlatform: (platform: Platform) => void
  
  // UI state
  showPromptDetails: boolean
  setShowPromptDetails: (show: boolean) => void
  
  // Generation state
  isGenerating: boolean
  canGenerate: boolean
  onGenerate: () => void
  error?: string | null
}

export default function InputPanel({
  mode,
  setMode,
  referenceImages,
  setReferenceImages,
  title,
  setTitle,
  prompt,
  setPrompt,
  platform,
  setPlatform,
  showPromptDetails,
  setShowPromptDetails,
  isGenerating,
  canGenerate,
  onGenerate,
  error
}: InputPanelProps) {
  const [previewImage, setPreviewImage] = useState<File | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [preprocessedImages, setPreprocessedImages] = useState<string[]>([])
  const [isPreprocessing, setIsPreprocessing] = useState(false)
  const [showGuidelines, setShowGuidelines] = useState(false)
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'

  // Preprocess images when platform or images change
  const preprocessImages = useCallback(async () => {
    if (!platform || platform === 'none' || referenceImages.length === 0) {
      return
    }

    setIsPreprocessing(true)
    
    try {
      const dimensions = platformSizes[platform]
      
      const processed = await Promise.all(
        referenceImages.map(async (file, index) => {
          try {
            const dataUrl = await fileToDataUrl(file)
            const processedImage = await preprocessImageForPlatform(dataUrl, dimensions.width, dimensions.height, platform)
            return processedImage
          } catch (error) {
            console.error(`Failed to preprocess image ${index + 1}:`, error)
            return await fileToDataUrl(file)
          }
        })
      )
      
      setPreprocessedImages(processed)
    } catch (error) {
      console.error('Preprocessing failed:', error)
      setPreprocessedImages([])
    } finally {
      setIsPreprocessing(false)
    }
  }, [platform, referenceImages])

  useEffect(() => {
    if (mode === 'image' && referenceImages.length > 0 && platform && platform !== 'none') {
      preprocessImages()
    } else {
      setPreprocessedImages([])
    }
  }, [mode, referenceImages, platform, preprocessImages])

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 9 - referenceImages.length)
      
      const validFiles = newFiles.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          alert(`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`)
          return false
        }
        return true
      })
      
      if (validFiles.length > 0) {
        setReferenceImages([...referenceImages, ...validFiles])
      }
    }
  }

  const removeImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index))
  }

  const openImagePreview = (file: File) => {
    setPreviewImage(file)
    setIsPreviewOpen(true)
  }

  const closeImagePreview = () => {
    setIsPreviewOpen(false)
    setPreviewImage(null)
  }

  const getImageInfo = (file: File, index: number) => {
    const dimensions = platform && platform !== 'none' ? platformSizes[platform] : null
    const isPreprocessed = Boolean(preprocessedImages[index] && preprocessedImages[index] !== '')
    
    return {
      width: dimensions?.width,
      height: dimensions?.height,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      platform: platform && platform !== 'none' ? platform : 'None',
      isPreprocessed: isPreprocessed
    }
  }

  const getDisplayImage = (file: File, index: number) => {
    if (preprocessedImages[index] && preprocessedImages[index] !== '') {
      return preprocessedImages[index]
    }
    return URL.createObjectURL(file)
  }

  const handleCopyPrompt = () => {
    let textToCopy
    if (platform !== 'none') {
      const enhancedMainPrompt = generatePlatformPrompt(platform, 'modern', prompt)
      textToCopy = title ? `${title}. ${enhancedMainPrompt}` : enhancedMainPrompt
    } else {
      textToCopy = title ? `${title}. ${prompt}` : prompt
    }
    navigator.clipboard.writeText(textToCopy)
  }

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt first')
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          context: 'image',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to enhance prompt')
      }

      const data = await response.json()
      setEnhancedPrompt(data.enhancedPrompt || '')
    } catch (error) {
      console.error('Enhancement error:', error)
      alert(error instanceof Error ? error.message : 'Failed to enhance prompt')
    } finally {
      setIsEnhancing(false)
    }
  }

  // Use enhanced prompt if available when generating
  useEffect(() => {
    if (enhancedPrompt) {
      setPrompt(enhancedPrompt)
      setEnhancedPrompt('')
    }
  }, [enhancedPrompt, setPrompt])

  return (
    <>
      <Card className="h-full bg-white border-gray-200 flex flex-col shadow-sm hover:shadow-md transition-all duration-300">
        <div className="p-5 space-y-4 flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl">
                <Sparkles className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Your Design</h2>
                <p className="text-xs text-gray-600">Configure your generation parameters</p>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              Generation Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setMode('image')}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-200",
                  "flex flex-col items-center gap-2 group",
                  mode === 'image'
                    ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "p-3 rounded-lg transition-colors",
                  mode === 'image'
                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                    : "bg-gray-100 group-hover:bg-gray-200"
                )}>
                  <ImageIcon className={cn(
                    "w-6 h-6",
                    mode === 'image' ? "text-white" : "text-gray-600"
                  )} />
                </div>
                <div className="text-center">
                  <div className={cn(
                    "font-semibold text-sm",
                    mode === 'image' ? "text-gray-900" : "text-gray-700"
                  )}>
                    Image to Image
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Upload reference images
                  </div>
                </div>
                {mode === 'image' && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setMode('text')}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-200",
                  "flex flex-col items-center gap-2 group",
                  mode === 'text'
                    ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "p-3 rounded-lg transition-colors",
                  mode === 'text'
                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                    : "bg-gray-100 group-hover:bg-gray-200"
                )}>
                  <FileText className={cn(
                    "w-6 h-6",
                    mode === 'text' ? "text-white" : "text-gray-600"
                  )} />
                </div>
                <div className="text-center">
                  <div className={cn(
                    "font-semibold text-sm",
                    mode === 'text' ? "text-gray-900" : "text-gray-700"
                  )}>
                    Text to Image
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Create from description
                  </div>
                </div>
                {mode === 'text' && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Reference Images (Image Mode) */}
          {mode === 'image' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                  Reference Images
                </label>
                <div className="flex items-center gap-2">
                  {isPreprocessing && (
                    <div className="flex items-center gap-1.5 text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Processing
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {referenceImages.length}/9
                  </span>
                </div>
              </div>
              
              {referenceImages.length === 0 ? (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200">
                    <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Click to upload images
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 5MB each (max 9 images)
                      </p>
                    </div>
                  </div>
                </label>
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  {referenceImages.map((file, index) => (
                    <div key={index} className="relative aspect-square group">
                      <div 
                        className="w-full h-full rounded-xl border-2 border-gray-200 bg-gray-50 overflow-hidden relative cursor-pointer hover:border-orange-300 hover:shadow-lg transition-all duration-200"
                        onClick={() => openImagePreview(file)}
                      >
                        <Image
                          src={getDisplayImage(file, index)}
                          alt={`Reference ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {platform && platform !== 'none' && preprocessedImages[index] && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-md shadow-sm">
                            Optimized
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(index)
                        }}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full hover:bg-red-600 shadow-md transition-colors z-10"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                  
                  {referenceImages.length < 9 && (
                    <label className="aspect-square cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-200">
                        <Plus className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs font-medium text-gray-600">Add</span>
                      </div>
                    </label>
                  )}
                </div>
              )}

              {platform && platform !== 'none' && referenceImages.length > 0 && (
                <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-orange-900">Auto-Optimization Active</span>
                  </div>
                  <p className="text-xs text-orange-700">
                    Images are automatically adjusted to {platformSizes[platform].width} × {platformSizes[platform].height} for {platformSizes[platform].label}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Text Mode Placeholder */}
          {mode === 'text' && (
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <div className="text-center">
                <div className="p-4 bg-white rounded-full mb-3 mx-auto w-fit shadow-sm">
                  <FileText className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">Text-to-Image Mode</p>
                <p className="text-xs text-gray-500 mt-1">Configure your prompt below</p>
              </div>
            </div>
          )}

          {/* Platform Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              Target Platform
            </label>
            <Select value={platform} onValueChange={(value) => setPlatform(value as Platform)}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900 h-12 rounded-xl hover:border-gray-300 transition-colors">
                <SelectValue>
                  <span className="flex items-center gap-3">
                    {React.createElement(platformIcons[platform] || platformIcons.none, { className: "w-5 h-5" })}
                    <span className="font-medium">{platformSizes[platform].label}</span>
                    {platform !== 'none' && (
                      <span className="text-xs text-gray-500 ml-auto">
                        {platformSizes[platform].width}×{platformSizes[platform].height}
                      </span>
                    )}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 max-h-[400px]">
                <SelectGroup>
                  <SelectLabel className="text-gray-600 text-xs font-semibold">Social Media</SelectLabel>
                  {['youtube', 'instagram', 'twitter', 'facebook', 'linkedin', 'tiktok', 'rednote', 'wechat'].map((p) => (
                    <SelectItem key={p} value={p} className="text-gray-900 hover:bg-gray-50">
                      <span className="flex items-center gap-3 w-full py-1">
                        {React.createElement(platformIcons[p as Platform], { className: "w-4 h-4" })}
                        <span className="flex-1 font-medium">{platformSizes[p as Platform].label}</span>
                        <span className="text-xs text-gray-500">
                          {platformSizes[p as Platform].width}×{platformSizes[p as Platform].height}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-gray-600 text-xs font-semibold">Music & Podcasts</SelectLabel>
                  <SelectItem value="spotify" className="text-gray-900 hover:bg-gray-50">
                    <span className="flex items-center gap-3 w-full py-1">
                      {React.createElement(platformIcons.spotify, { className: "w-4 h-4" })}
                      <span className="flex-1 font-medium">{platformSizes.spotify.label}</span>
                      <span className="text-xs text-gray-500">
                        {platformSizes.spotify.width}×{platformSizes.spotify.height}
                      </span>
                    </span>
                  </SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-gray-600 text-xs font-semibold">Custom</SelectLabel>
                  <SelectItem value="none" className="text-gray-900 hover:bg-gray-50">
                    <span className="flex items-center gap-3 w-full py-1">
                      {React.createElement(platformIcons.none, { className: "w-4 h-4" })}
                      <span className="flex-1 font-medium">{platformSizes.none.label}</span>
                    </span>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Platform Guidelines */}
          {platform !== 'none' && (
            <div className="space-y-2">
              <button
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                <Info className="h-4 w-4" />
                {platformSizes[platform].label} Best Practices
                {showGuidelines ? (
                  <ChevronUp className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </button>
              
              {showGuidelines && (
                <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 space-y-2 animate-in slide-in-from-top duration-200">
                  {platformGuidelines[platform].map((guideline, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                      <span className="text-sm text-gray-700">{guideline}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              Title
              <span className="text-xs font-normal text-gray-500">(Optional)</span>
            </label>
            <Input
              placeholder="My awesome content..."
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-10 rounded-xl hover:border-gray-300 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
              Description
            </label>
            <div className="relative">
              <Textarea
                placeholder="Describe your desired image in detail..."
                value={prompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                className="min-h-[120px] bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 resize-none rounded-xl hover:border-gray-300 focus:border-orange-500 transition-colors pr-24 pb-12"
              />
              <Button
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                size="sm"
                variant="outline"
                className="absolute right-2 bottom-2 inline-flex items-center gap-2 rounded-lg border-2 border-purple-500 bg-purple-50 px-3 py-1.5 font-medium text-purple-700 text-sm shadow-sm transition-all duration-300 hover:bg-purple-100"
              >
                {isEnhancing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
              </Button>
            </div>
            {enhancedPrompt && (
              <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 font-semibold text-purple-900 text-sm">
                    <Sparkles className="h-4 w-4" />
                    Enhanced Prompt
                  </h4>
                  <Button
                    onClick={() => setEnhancedPrompt('')}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-600 hover:text-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={enhancedPrompt}
                  onChange={(e) => setEnhancedPrompt(e.target.value)}
                  className="resize-none border border-purple-200 bg-white text-sm"
                  rows={5}
                />
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={handleCopyPrompt}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Copy Enhanced Prompt
            </Button>
          </div>

          {/* AI Enhancement Preview */}
          {platform !== 'none' && prompt && (
            <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-gray-900">AI Enhancement Active</p>
                  <div className="flex flex-wrap gap-2">
                    {platformEnhancements[platform].slice(0, 3).map((enhancement) => (
                      <Badge key={enhancement} className="text-xs bg-white text-gray-700 border border-gray-200 px-2.5 py-0.5 font-medium">
                        {enhancement}
                      </Badge>
                    ))}
                    {platformEnhancements[platform].length > 3 && (
                      <Badge className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-0.5 font-medium">
                        +{platformEnhancements[platform].length - 3} more
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 p-0 text-xs text-blue-600 hover:text-blue-700"
                    onClick={() => setShowPromptDetails(!showPromptDetails)}
                  >
                    {showPromptDetails ? 'Hide' : 'Show'} enhanced prompt
                    {showPromptDetails ? (
                      <ChevronUp className="w-3 h-3 ml-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
              
              {showPromptDetails && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 text-xs font-mono text-gray-700 break-words max-h-32 overflow-y-auto">
                  {(() => {
                    const enhancedMainPrompt = generatePlatformPrompt(platform, 'modern', prompt)
                    return title ? `${title}. ${enhancedMainPrompt}` : enhancedMainPrompt
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="border-red-500/50 bg-red-50 rounded-xl">
              <AlertDescription className="text-sm text-red-700">
                <div className="flex flex-col gap-3">
                  <span>{error}</span>
                  {(error.includes('upgrade to Pro plan') || error.includes('limit reached')) && (
                    <Link href={`/${locale}/pricing`}>
                      <Button 
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-md hover:shadow-lg transition-all h-10 rounded-lg"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </Link>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <Button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className={cn(
              "w-full h-12 font-bold text-base rounded-xl shadow-lg transition-all duration-200"
              "bg-gradient-to-r from-orange-500 to-red-500",
              "hover:from-orange-600 hover:to-red-600",
              "disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none",
              canGenerate && !isGenerating && "hover:shadow-xl hover:scale-[1.02]"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Your Design...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Now
              </>
            )}
          </Button>

          {/* Pro Features Notice */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Batch Processing</span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-md">PRO</span>
              </div>
              <Link href={`/${locale}/pricing`}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          isOpen={isPreviewOpen}
          onClose={closeImagePreview}
          imageUrl={getDisplayImage(previewImage, referenceImages.indexOf(previewImage))}
          title="Reference Image Preview"
          subtitle="Click to view image details and dimensions"
          imageInfo={getImageInfo(previewImage, referenceImages.indexOf(previewImage))}
        />
      )}
    </>
  )
}
