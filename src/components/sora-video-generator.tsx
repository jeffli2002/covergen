'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Video, Download, AlertCircle, Share2, Upload, ImageIcon, X } from 'lucide-react'

interface GenerationResult {
  taskId: string
  videoUrl?: string
  status: 'pending' | 'generating' | 'success' | 'failed'
  error?: string
}

type GenerationMode = 'text-to-video' | 'image-to-video'

export default function SoraVideoGenerator() {
  const [mode, setMode] = useState<GenerationMode>('text-to-video')
  const [prompt, setPrompt] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait'>('landscape')
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
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

  const handleGenerate = async () => {
    // Validation
    if (mode === 'text-to-video' && !prompt.trim()) {
      alert('Please enter a prompt for text-to-video generation')
      return
    }

    if (mode === 'image-to-video' && !imageFile) {
      alert('Please upload an image for image-to-video generation')
      return
    }

    setIsGenerating(true)
    setResult(null)

    try {
      let imageUrl = ''

      // Upload image if in image-to-video mode
      if (mode === 'image-to-video') {
        if (!imageFile) {
          throw new Error('Please select an image for image-to-video generation')
        }

        setIsUploading(true)
        const uploadFormData = new FormData()
        uploadFormData.append('image', imageFile)

        const uploadResponse = await fetch('/api/sora/upload-image', {
          method: 'POST',
          body: uploadFormData
        })

        const uploadData = await uploadResponse.json()

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Failed to upload image')
        }

        if (!uploadData.imageUrl) {
          throw new Error('Upload succeeded but no image URL returned')
        }

        imageUrl = uploadData.imageUrl
        console.log('Image uploaded successfully:', imageUrl)
        setIsUploading(false)
      }

      // Create video generation task
      const requestBody: any = {
        mode,
        aspect_ratio: aspectRatio,
        quality
      }

      if (mode === 'text-to-video') {
        requestBody.prompt = prompt.trim()
        console.log('[Sora] text-to-video request:', { prompt: prompt.trim().substring(0, 50) + '...' })
      } else {
        if (!imageUrl) {
          throw new Error('Image URL is missing after upload')
        }
        requestBody.image_url = imageUrl
        console.log('[Sora] image-to-video request:', { 
          imageUrl: imageUrl.substring(0, 50) + '...',
          hasPrompt: !!prompt.trim()
        })
        if (prompt.trim()) {
          requestBody.prompt = prompt.trim()
        }
      }

      console.log('[Sora] Creating task with body:', { ...requestBody, image_url: requestBody.image_url ? 'SET' : 'MISSING' })

      const createResponse = await fetch('/api/sora/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const createData = await createResponse.json()

      if (!createResponse.ok) {
        throw new Error(createData.error || 'Failed to create task')
      }

      const taskId = createData.taskId
      setResult({ taskId, status: 'generating' })

      // Poll for result
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/sora/query?taskId=${taskId}`)
          const statusData = await statusResponse.json()

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
            setResult({
              taskId,
              status: 'failed',
              error: statusData.failMsg || 'Generation failed'
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
                <Textarea
                  placeholder={textDefaultPrompt}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, maxPromptLength))}
                  rows={8}
                  className="resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 font-light"
                />
                <div className="text-xs text-gray-400 text-right font-light">
                  {prompt.length} / {maxPromptLength}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image-to-video" className="mt-0 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-light text-gray-700">Source Image</label>
                
                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
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
                  Motion Prompt <span className="text-gray-400">(Optional)</span>
                </label>
                <Textarea
                  placeholder={imageDefaultPrompt}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, maxPromptLength))}
                  rows={4}
                  className="resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 font-light"
                />
                <div className="text-xs text-gray-400 text-right font-light">
                  {prompt.length} / {maxPromptLength}
                </div>
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
    </div>
  )
}
