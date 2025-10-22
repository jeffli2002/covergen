'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Video, Download, AlertCircle, Share2, Upload, ImageIcon, X } from 'lucide-react'
import { UpgradePrompt } from '@/components/pricing/UpgradePrompt'
import AuthForm from '@/components/auth/AuthForm'
import { useBestAuth } from '@/hooks/useBestAuth'
import { PRICING_CONFIG } from '@/config/pricing.config'

interface GenerationResult {
  taskId: string
  videoUrl?: string
  status: 'pending' | 'generating' | 'success' | 'failed'
  error?: string
}

type GenerationMode = 'text-to-video' | 'image-to-video'

export default function SoraVideoGenerator() {
  const { user } = useBestAuth()
  const [mode, setMode] = useState<GenerationMode>('text-to-video')
  const [prompt, setPrompt] = useState('')
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait'>('landscape')
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'credits' | 'daily_limit' | 'monthly_limit' | 'video_limit' | 'pro_feature'>('credits')
  const [currentCredits, setCurrentCredits] = useState(0)
  const [requiredCredits, setRequiredCredits] = useState(20)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxPromptLength = 5000
  const textDefaultPrompt = 'A professor stands at the front of a lively classroom, enthusiastically giving a lecture. On the blackboard behind him are colorful chalk diagrams. With an animated gesture, he declares to the students: "Sora 2 is now available on Kie AI, making it easier than ever to create stunning videos." The students listen attentively, some smiling and taking notes.'
  const imageDefaultPrompt = 'Camera slowly zooms in, cinematic lighting, smooth motion'

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file must be less than 10MB')
      return
    }

    setImageFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP)')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('Image file must be less than 10MB')
        return
      }

      setImageFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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
          context: 'video',
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

  const handleGenerate = async () => {
    console.log('[Sora] handleGenerate called:', { mode, hasImageFile: !!imageFile, hasPrompt: !!prompt })
    
    // Check authentication FIRST before any validation
    if (!user) {
      console.log('[Sora] User not authenticated, showing auth modal')
      setShowAuthModal(true)
      return
    }
    
    // Validation
    if (mode === 'text-to-video' && !prompt.trim()) {
      alert('Please enter a prompt for text-to-video generation')
      return
    }

    if (mode === 'image-to-video' && !imageFile && !imagePreview) {
      console.error('[Sora] Validation failed: No image file in image-to-video mode')
      alert('Please upload an image for image-to-video generation')
      return
    }

    setIsGenerating(true)
    setResult(null)

    try {
      let imageUrl = ''

      // Upload image if in image-to-video mode
      if (mode === 'image-to-video') {
        setIsUploading(true)
        
        // Check if using a local Next.js path (example images)
        if (imagePreview && imagePreview.startsWith('/')) {
          console.log('[Sora] Example image detected, fetching and uploading:', imagePreview)
          
          try {
            // Fetch the example image from server
            const imageResponse = await fetch(imagePreview)
            if (!imageResponse.ok) {
              throw new Error(`Failed to fetch example image: ${imageResponse.status}`)
            }
            
            // Convert to blob
            const blob = await imageResponse.blob()
            
            // Upload to Cloudinary
            const uploadFormData = new FormData()
            uploadFormData.append('image', blob, 'example-image.jpg')

            const uploadResponse = await fetch('/api/sora/upload-image', {
              method: 'POST',
              body: uploadFormData
            })

            const uploadData = await uploadResponse.json()
            console.log('[Sora] Example image upload response:', { ok: uploadResponse.ok, data: uploadData })

            if (!uploadResponse.ok) {
              throw new Error(uploadData.error || 'Failed to upload example image')
            }

            if (!uploadData.imageUrl) {
              throw new Error('Upload succeeded but no image URL returned')
            }

            imageUrl = uploadData.imageUrl
            console.log('[Sora] Example image uploaded to Cloudinary:', imageUrl)
          } catch (error) {
            console.error('[Sora] Failed to process example image:', error)
            setIsUploading(false)
            throw new Error(`Failed to process example image: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        } else if (!imageFile) {
          setIsUploading(false)
          throw new Error('Please select an image for image-to-video generation')
        } else {
          // Upload user-selected image
          const uploadFormData = new FormData()
          uploadFormData.append('image', imageFile)

          const uploadResponse = await fetch('/api/sora/upload-image', {
            method: 'POST',
            body: uploadFormData
          })

          const uploadData = await uploadResponse.json()
          console.log('[Sora] Upload response:', { ok: uploadResponse.ok, status: uploadResponse.status, data: uploadData })

          if (!uploadResponse.ok) {
            console.error('[Sora] Upload failed:', uploadData)
            setIsUploading(false)
            throw new Error(uploadData.error || 'Failed to upload image')
          }

          if (!uploadData.imageUrl) {
            console.error('[Sora] Upload response missing imageUrl:', uploadData)
            setIsUploading(false)
            throw new Error('Upload succeeded but no image URL returned')
          }

          imageUrl = uploadData.imageUrl
          console.log('[Sora] Image uploaded successfully, URL length:', imageUrl.length)
        }
        
        setIsUploading(false)
      }

      // Create video generation task
      const requestBody: any = {
        mode,
        aspect_ratio: aspectRatio,
        quality
      }

      // Use enhanced prompt if available, otherwise use regular prompt
      const finalPrompt = enhancedPrompt || prompt.trim()

      if (mode === 'text-to-video') {
        requestBody.prompt = finalPrompt
        console.log('[Sora] text-to-video request:', { prompt: finalPrompt.substring(0, 50) + '...' })
      } else {
        if (!imageUrl) {
          throw new Error('Image URL is missing after upload')
        }
        
        if (!finalPrompt) {
          throw new Error('Prompt is required for image-to-video')
        }
        
        requestBody.image_url = imageUrl
        requestBody.prompt = finalPrompt
        
        console.log('[Sora] image-to-video request:', { 
          imageUrl: imageUrl.substring(0, 50) + '...',
          prompt: prompt.trim().substring(0, 30) + '...',
          aspectRatio
        })
      }

      console.log('[Sora] Creating task with body:', { ...requestBody, image_url: requestBody.image_url ? 'SET' : 'MISSING' })

      const createResponse = await fetch('/api/sora/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const createData = await createResponse.json()
      console.log('[Sora] Create response:', { ok: createResponse.ok, status: createResponse.status, data: createData })

      if (!createResponse.ok) {
        console.error('[Sora] Create task failed:', createData)
        
        // Handle insufficient credits
        if (createResponse.status === 402 || (createData.error && createData.error.includes('credits'))) {
          const cost = quality === 'hd' ? PRICING_CONFIG.generationCosts.sora2ProVideo : PRICING_CONFIG.generationCosts.sora2Video
          setRequiredCredits(cost)
          setCurrentCredits(createData.currentCredits || 0)
          setUpgradeReason('credits')
          setShowUpgradeModal(true)
          throw new Error(createData.error || 'Insufficient credits for video generation')
        }
        
        // Handle limit reached with upgrade modal
        if (createResponse.status === 429 && createData.limitReached) {
          if (createData.dailyLimit) {
            setUpgradeReason('daily_limit')
          } else if (createData.monthlyLimit) {
            setUpgradeReason('monthly_limit')
          } else {
            setUpgradeReason('video_limit')
          }
          setShowUpgradeModal(true)
          throw new Error(createData.error || 'Video generation limit reached')
        }
        
        // Handle free tier video generation restriction
        if (createResponse.status === 403 && createData.error?.includes('Pro')) {
          setUpgradeReason('video_limit')
          setShowUpgradeModal(true)
          throw new Error(createData.error || 'Sora 2 video generation requires a Pro plan')
        }
        
        // Handle authentication required
        if (createResponse.status === 401) {
          throw new Error('Please sign in to generate videos')
        }
        
        throw new Error(createData.error || createData.details?.msg || 'Failed to create task')
      }

      const taskId = createData.taskId
      setResult({ taskId, status: 'generating' })

      // Poll for result
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/sora/query?taskId=${taskId}`)
          const statusData = await statusResponse.json()
          console.log('[Sora] Poll response:', { state: statusData.state, failMsg: statusData.failMsg })

          if (!statusResponse.ok) {
            throw new Error(statusData.error || 'Failed to query task')
          }

          if (statusData.state === 'success') {
            clearInterval(pollInterval)
            const resultUrls = JSON.parse(statusData.resultJson).resultUrls
            setResult({
              taskId,
              videoUrl: resultUrls[0],
              status: 'success'
            })
            setIsGenerating(false)
          } else if (statusData.state === 'fail') {
            clearInterval(pollInterval)
            let errorMessage = statusData.failMsg || 'Generation failed'
            
            // Show specific copyright/safety filter messages
            if (errorMessage.includes('copyrighted material')) {
              errorMessage = 'Generation blocked by copyright detection.\n\n' +
                'OpenAI detected this image may contain copyrighted content.\n\n' +
                'Please try:\n' +
                '• Using your own original photos\n' +
                '• Using stock images with commercial licenses\n' +
                '• Avoiding images with logos, brands, or recognizable people'
            } else if (errorMessage.includes('safety') || errorMessage.includes('policy') || errorMessage.includes('违反')) {
              errorMessage = 'Generation failed: Content policy violation.\n\n' +
                'Please try:\n' +
                '• Using a different image or prompt\n' +
                '• Ensuring content follows community guidelines'
            }
            
            if (statusData.failCode) {
              errorMessage += `\n\n(Error Code: ${statusData.failCode})`
            }
            
            console.error('[Sora] Generation failed:', { failCode: statusData.failCode, failMsg: statusData.failMsg, param: statusData.param })
            
            alert(errorMessage)
            
            setResult({
              taskId,
              status: 'failed',
              error: errorMessage
            })
            setIsGenerating(false)
          }
        } catch (error) {
          clearInterval(pollInterval)
          setResult({
            taskId,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          setIsGenerating(false)
        }
      }, 5000)

      // Timeout after 5 minutes
      setTimeout(() => {
        if (isGenerating) {
          clearInterval(pollInterval)
          setResult({
            taskId,
            status: 'failed',
            error: 'Generation timeout (5 minutes)'
          })
          setIsGenerating(false)
        }
      }, 300000)

    } catch (error) {
      setResult({
        taskId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      setIsGenerating(false)
      setIsUploading(false)
    }
  }

  const handleDownload = async (videoUrl: string) => {
    try {
      const response = await fetch(videoUrl, { 
        mode: 'cors',
        credentials: 'omit'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch video')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sora-video-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      window.open(videoUrl, '_blank')
    }
  }

  const handleShare = async () => {
    if (!result?.videoUrl) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sora 2 Generated Video',
          text: 'Check out this AI-generated video created with Sora 2!',
          url: result.videoUrl
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      navigator.clipboard.writeText(result.videoUrl)
      alert('Video URL copied to clipboard!')
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  const canGenerate = mode === 'text-to-video' 
    ? prompt.trim().length > 0 
    : imageFile !== null

  return (
    <div className="max-w-7xl mx-auto">
      <Tabs value={mode} onValueChange={(v) => setMode(v as GenerationMode)} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="text-to-video" className="font-light">
            <Video className="w-4 h-4 mr-2" />
            Text to Video
          </TabsTrigger>
          <TabsTrigger value="image-to-video" className="font-light">
            <ImageIcon className="w-4 h-4 mr-2" />
            Image to Video
          </TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Generator Form */}
          <div className="space-y-6">
            <TabsContent value="text-to-video" className="mt-0 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-light text-gray-700">Video Description</label>
                <div className="relative">
                  <Textarea
                    placeholder={textDefaultPrompt}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value.slice(0, maxPromptLength))}
                    rows={8}
                    className="resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 font-light pr-24 pb-12"
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
                <div className="text-xs text-gray-400 text-right font-light">
                  {prompt.length} / {maxPromptLength}
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
                      onChange={(e) => setEnhancedPrompt(e.target.value.slice(0, maxPromptLength))}
                      className="resize-none border border-purple-200 bg-white text-sm"
                      rows={5}
                    />
                    <p className="mt-1 text-right text-purple-700 text-xs">
                      {enhancedPrompt.length} / {maxPromptLength}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="image-to-video" className="mt-0 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-light text-gray-700">Source Image</label>
                
                <div className="mb-3 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 mb-1">
                        Sora 2 Image Requirements
                      </p>
                      <p className="text-xs font-light text-amber-800 leading-relaxed">
                        Sora 2 has strict requirements for uploaded images. <strong>Images containing people or faces are not supported</strong> and will be automatically rejected. Please use images with landscapes, objects, or scenes without any people.
                      </p>
                      <p className="text-xs font-light text-amber-700 mt-2">
                        ✓ Allowed: Landscapes, nature, objects, abstract art, patterns
                        <br />
                        ✗ Not allowed: People, faces, brand logos, watermarks
                      </p>
                    </div>
                  </div>
                </div>
                
                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm font-light text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs font-light text-gray-400">
                      JPEG, PNG, or WebP (max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full rounded-xl border border-gray-200"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-light text-gray-700">
                  Motion Prompt <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Textarea
                    placeholder={imageDefaultPrompt}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value.slice(0, maxPromptLength))}
                    rows={4}
                    className="resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 font-light pr-24 pb-12"
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
                <div className="text-xs text-gray-400 text-right font-light">
                  {prompt.length} / {maxPromptLength}
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
                      onChange={(e) => setEnhancedPrompt(e.target.value.slice(0, maxPromptLength))}
                      className="resize-none border border-purple-200 bg-white text-sm"
                      rows={5}
                    />
                    <p className="mt-1 text-right text-purple-700 text-xs">
                      {enhancedPrompt.length} / {maxPromptLength}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Common Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-light text-gray-700">Aspect Ratio</label>
                <Select value={aspectRatio} onValueChange={(v: 'landscape' | 'portrait') => setAspectRatio(v)}>
                  <SelectTrigger className="border-gray-200 font-light">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                    <SelectItem value="portrait">Portrait (9:16)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-light text-gray-700">Quality</label>
                <Select value={quality} onValueChange={(v: 'standard' | 'hd') => setQuality(v)}>
                  <SelectTrigger className="border-gray-200 font-light">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !canGenerate}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-light"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading Image...
                </>
              ) : isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Video Preview */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              {!result && (
                <div className="aspect-video bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Video className="w-16 h-16 mx-auto text-purple-300" />
                    <p className="text-sm font-light text-gray-500">Your generated video will appear here</p>
                  </div>
                </div>
              )}

              {result?.status === 'generating' && (
                <div className="aspect-video bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600" />
                    <p className="text-base font-light text-gray-700">Generating your video...</p>
                    <p className="text-xs font-light text-gray-500">This may take a few minutes</p>
                  </div>
                </div>
              )}

              {result?.status === 'success' && result.videoUrl && (
                <div className="space-y-4">
                  <video
                    src={result.videoUrl}
                    controls
                    className="w-full rounded-xl"
                    autoPlay
                    loop
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleDownload(result.videoUrl!)}
                      variant="outline"
                      className="font-light border-gray-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="font-light border-gray-200"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              )}

              {result?.status === 'failed' && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-light text-red-900">Generation Failed</p>
                    <p className="text-sm font-light text-red-700">{result.error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Tabs>

      {/* Auth Modal - for unauthenticated users */}
      {showAuthModal && (
        <AuthForm 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Upgrade Modal - for credits/limits scenarios */}
      <UpgradePrompt 
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={upgradeReason}
        currentCredits={currentCredits}
        requiredCredits={requiredCredits}
        generationType={quality === 'hd' ? 'sora2ProVideo' : 'sora2Video'}
      />
    </div>
  )
}
