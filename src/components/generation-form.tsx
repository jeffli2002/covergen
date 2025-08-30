'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, Sparkles, Info, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { platformSizes, styleTemplates, type Platform, type StyleTemplate } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { platformIcons, platformGuidelines, platformEnhancements, generatePlatformPrompt } from '@/lib/platform-configs'

export default function GenerationForm() {
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [platform, setPlatform] = useState<Platform>('none')
  const [style, setStyle] = useState<StyleTemplate>('tech')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPromptDetails, setShowPromptDetails] = useState(false)
  
  const { user, addTask } = useAppStore()

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatar(e.target.files[0])
    }
  }

  const handleGenerate = async () => {
    if (!title.trim() || !prompt.trim() || !user) return
    
    setIsGenerating(true)
    
    // Generate enhanced prompt for the selected platform
    const enhancedPrompt = generatePlatformPrompt(platform, style, title, prompt)
    
    // Create new generation task
    const task = {
      id: `task_${Date.now()}`,
      status: 'processing' as const,
      title,
      prompt,
      platform,
      style,
      enhancedPrompt, // Include the enhanced prompt
      dimensions: platform === 'none' ? undefined : platformSizes[platform], // Include platform dimensions, none for no platform constraints
      avatarUrl: avatar ? URL.createObjectURL(avatar) : undefined,
      results: [],
      createdAt: new Date()
    }
    
    addTask(task)
    
    // Call the generation API
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          mode: 'text',
          style: style,
          platform: platform,
          dimensions: platform === 'none' ? undefined : platformSizes[platform],
        }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      
      useAppStore.getState().updateTask(task.id, {
        status: 'completed',
        results: data.images || []
      })
    } catch (error) {
      console.error('Generation error:', error)
      useAppStore.getState().updateTask(task.id, {
        status: 'failed',
        results: []
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const canGenerate = user && title.trim() && prompt.trim() && 
    (user.tier !== 'free' || user.quotaUsed < user.quotaLimit)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          AI Cover Generator
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          Create stunning covers for your content across platforms
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Video/Podcast Title</label>
          <Input
            placeholder="Enter your content title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">{title.length}/200 characters</p>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt</label>
          <Input
            placeholder="Enter your prompt description..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">{prompt.length}/500 characters</p>
        </div>

        {/* Avatar Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Avatar/Logo (Optional)</label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground mb-2">
              Upload your avatar or logo
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="avatar-upload" className="cursor-pointer">
                Choose File
              </label>
            </Button>
            {avatar && (
              <p className="text-xs text-primary mt-2">✓ {avatar.name}</p>
            )}
          </div>
        </div>

        {/* Platform Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Platform</label>
          <Select value={platform} onValueChange={(value) => setPlatform(value as Platform)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {platform === 'none' ? (
                  <span className="flex items-center gap-2">
                    {React.createElement(platformIcons.none, { className: "w-4 h-4" })}
                    {platformSizes.none.label}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {React.createElement(platformIcons[platform], { className: "w-4 h-4" })}
                    {platformSizes[platform].label}
                    {platformSizes[platform].width && platformSizes[platform].height && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {platformSizes[platform].width}×{platformSizes[platform].height}
                      </span>
                    )}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Social Media</SelectLabel>
                <SelectItem value="youtube">
                  <span className="flex items-center gap-2 w-full">
                    {React.createElement(platformIcons.youtube, { className: "w-4 h-4" })}
                    <span className="flex-1">{platformSizes.youtube.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {platformSizes.youtube.width}×{platformSizes.youtube.height}
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="twitter">
                  <span className="flex items-center gap-2 w-full">
                    {React.createElement(platformIcons.twitter, { className: "w-4 h-4" })}
                    <span className="flex-1">{platformSizes.twitter.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {platformSizes.twitter.width}×{platformSizes.twitter.height}
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="tiktok">
                  <span className="flex items-center gap-2 w-full">
                    {React.createElement(platformIcons.tiktok, { className: "w-4 h-4" })}
                    <span className="flex-1">{platformSizes.tiktok.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {platformSizes.tiktok.width}×{platformSizes.tiktok.height}
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="xiaohongshu">
                  <span className="flex items-center gap-2 w-full">
                    {React.createElement(platformIcons.xiaohongshu, { className: "w-4 h-4" })}
                    <span className="flex-1">{platformSizes.xiaohongshu.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {platformSizes.xiaohongshu.width}×{platformSizes.xiaohongshu.height}
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="wechat">
                  <span className="flex items-center gap-2 w-full">
                    {React.createElement(platformIcons.wechat, { className: "w-4 h-4" })}
                    <span className="flex-1">{platformSizes.wechat.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {platformSizes.wechat.width}×{platformSizes.wechat.height}
                    </span>
                  </span>
                </SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Music & Podcasts</SelectLabel>
                <SelectItem value="spotify">
                  <span className="flex items-center gap-2 w-full">
                    {React.createElement(platformIcons.spotify, { className: "w-4 h-4" })}
                    <span className="flex-1">{platformSizes.spotify.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {platformSizes.spotify.width}×{platformSizes.spotify.height}
                    </span>
                  </span>
                </SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Video Platforms</SelectLabel>
                <SelectItem value="bilibili">
                  <span className="flex items-center gap-2 w-full">
                    {React.createElement(platformIcons.bilibili, { className: "w-4 h-4" })}
                    <span className="flex-1">{platformSizes.bilibili.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {platformSizes.bilibili.width}×{platformSizes.bilibili.height}
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="twitch">
                  <span className="flex items-center gap-2 w-full">
                    {React.createElement(platformIcons.twitch, { className: "w-4 h-4" })}
                    <span className="flex-1">{platformSizes.twitch.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {platformSizes.twitch.width}×{platformSizes.twitch.height}
                    </span>
                  </span>
                </SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Custom</SelectLabel>
                <SelectItem value="none">
                  <span className="flex items-center gap-2 w-full">
                    {React.createElement(platformIcons.none, { className: "w-4 h-4" })}
                    <span className="flex-1">{platformSizes.none.label}</span>
                    <span className="text-xs text-muted-foreground">
                      Uses input image size
                    </span>
                  </span>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Platform Guidelines */}
        {platform !== 'none' && (
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>{platformSizes[platform].label} Guidelines:</strong>
              <ul className="mt-1 space-y-1 text-xs">
                {platformGuidelines[platform].map((guideline) => (
                  <li key={guideline} className="flex items-start gap-1">
                    <CheckCircle className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                    {guideline}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Style Templates */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Style Template</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {styleTemplates.map((template) => (
              <Button
                key={template.id}
                variant={style === template.id ? "default" : "outline"}
                size="sm"
                onClick={() => setStyle(template.id)}
                className="h-auto py-2 text-xs md:text-sm"
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Enhancement Preview */}
        {platform !== 'none' && (
          <div className="mt-4 p-3 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">AI Enhancement Active</p>
                <p className="text-xs text-muted-foreground">
                  Your cover will be optimized for {platformSizes[platform].label} with:
                </p>
                <div className="flex flex-wrap gap-2">
                  {platformEnhancements[platform].map((enhancement) => (
                    <Badge key={enhancement} variant="secondary" className="text-xs">
                      {enhancement}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setShowPromptDetails(!showPromptDetails)}
                >
                  {showPromptDetails ? 'Hide' : 'Show'} technical details
                  {showPromptDetails ? (
                    <ChevronUp className="w-3 h-3 ml-1" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-1" />
                  )}
                </Button>
              </div>
            </div>
            
            {showPromptDetails && (
              <div className="mt-3 p-2 bg-muted rounded text-xs font-mono">
                {generatePlatformPrompt(platform, style, title || '[Your title]', prompt || '[Your prompt]')}
              </div>
            )}
          </div>
        )}

        {/* Quota Info */}
        {user && (
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm">
              <span className="font-medium">Quota:</span> {user.quotaUsed}/{user.quotaLimit} 
              <span className="text-muted-foreground ml-1">
                ({user.tier === 'free' ? 'Daily' : 'Monthly'})
              </span>
            </div>
            {user.tier === 'free' && user.quotaUsed >= user.quotaLimit && (
              <p className="text-sm text-destructive mt-1">
                Daily quota exceeded. Upgrade to Pro for more generations.
              </p>
            )}
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Covers
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}