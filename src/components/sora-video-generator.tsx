'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Video, Download, AlertCircle, Share2 } from 'lucide-react'

interface GenerationResult {
  taskId: string
  videoUrl?: string
  status: 'pending' | 'generating' | 'success' | 'failed'
  error?: string
}

export default function SoraVideoGenerator() {
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait'>('landscape')
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)

  const maxPromptLength = 5000
  const defaultPrompt = 'A professor stands at the front of a lively classroom, enthusiastically giving a lecture. On the blackboard behind him are colorful chalk diagrams. With an animated gesture, he declares to the students: "Sora 2 is now available on Kie AI, making it easier than ever to create stunning videos." The students listen attentively, some smiling and taking notes.'

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setResult(null)

    try {
      const createResponse = await fetch('/api/sora/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspect_ratio: aspectRatio,
          quality
        })
      })

      const createData = await createResponse.json()

      if (!createResponse.ok) {
        throw new Error(createData.error || 'Failed to create task')
      }

      const taskId = createData.taskId
      setResult({ taskId, status: 'generating' })

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
    }
  }

  const handleDownload = async (videoUrl: string) => {
    try {
      const response = await fetch(videoUrl)
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
      alert('Failed to download video')
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Generator Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-light text-gray-700">Prompt</label>
            <Textarea
              placeholder={defaultPrompt}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, maxPromptLength))}
              rows={8}
              className="resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 font-light"
            />
            <div className="text-xs text-gray-400 text-right font-light">
              {prompt.length} / {maxPromptLength}
            </div>
          </div>

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
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-light"
            size="lg"
          >
            {isGenerating ? (
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
    </div>
  )
}
