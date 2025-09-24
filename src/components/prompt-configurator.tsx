'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Loader2,
  Info,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Crown
} from 'lucide-react'
import { platformSizes, type Platform } from '@/lib/utils'
import { platformIcons, platformGuidelines, platformEnhancements, generatePlatformPrompt } from '@/lib/platform-configs'

interface PromptConfiguratorProps {
  title: string
  setTitle: (title: string) => void
  platform: Platform
  setPlatform: (platform: Platform) => void
  prompt: string
  setPrompt: (prompt: string) => void
  showPromptDetails: boolean
  setShowPromptDetails: (show: boolean) => void
  isGenerating: boolean
  canGenerate: boolean
  onGenerate: () => void
  error?: string | null
}

export default function PromptConfigurator({
  title,
  setTitle,
  platform,
  setPlatform,
  prompt,
  setPrompt,
  showPromptDetails,
  setShowPromptDetails,
  isGenerating,
  canGenerate,
  onGenerate,
  error
}: PromptConfiguratorProps) {
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

  return (
    <Card className="h-full bg-white border-gray-200 flex flex-col shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 md:p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">Step 2: Configure</h3>
          </div>
          <p className="text-xs md:text-sm text-gray-600">Set up your generation parameters</p>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Optional Title */}
          <div className="space-y-2">
            <label className="text-xs md:text-sm font-medium text-gray-900">Title (Optional)</label>
            <Input
              placeholder="My awesome content..."
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 text-sm"
            />
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <label className="text-xs md:text-sm font-medium text-gray-900">Platform</label>
            <Select value={platform} onValueChange={(value) => setPlatform(value as Platform)}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900 text-sm">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    {React.createElement(platformIcons[platform] || platformIcons.none, { className: "w-4 h-4" })}
                    <span className="hidden sm:inline">{platformSizes[platform].label}</span>
                    <span className="sm:hidden">{platformSizes[platform].label.split(' ')[0]}</span>
                    <span className="text-xs text-gray-500 ml-auto hidden sm:inline">
                      {platformSizes[platform].width}×{platformSizes[platform].height}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 max-h-[300px]">
                <SelectGroup>
                  <SelectLabel className="text-gray-600 text-xs">Social Media</SelectLabel>
                  {['youtube', 'instagram', 'twitter', 'facebook', 'linkedin', 'tiktok', 'rednote', 'wechat'].map((p) => (
                    <SelectItem key={p} value={p} className="text-gray-900 hover:bg-gray-50 text-sm">
                      <span className="flex items-center gap-2 w-full">
                        {React.createElement(platformIcons[p as Platform], { className: "w-4 h-4" })}
                        <span className="flex-1">{platformSizes[p as Platform].label}</span>
                        <span className="text-xs text-gray-500 hidden sm:inline">
                          {platformSizes[p as Platform].width}×{platformSizes[p as Platform].height}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-gray-600 text-xs">Music & Podcasts</SelectLabel>
                  <SelectItem value="spotify" className="text-gray-900 hover:bg-gray-50 text-sm">
                    <span className="flex items-center gap-2 w-full">
                      {React.createElement(platformIcons.spotify, { className: "w-4 h-4" })}
                      <span className="flex-1">{platformSizes.spotify.label}</span>
                      <span className="text-xs text-gray-500 hidden sm:inline">
                        {platformSizes.spotify.width}×{platformSizes.spotify.height}
                      </span>
                    </span>
                  </SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-gray-600 text-xs">Custom</SelectLabel>
                  <SelectItem value="none" className="text-gray-900 hover:bg-gray-50 text-sm">
                    <span className="flex items-center gap-2 w-full">
                      {React.createElement(platformIcons.none, { className: "w-4 h-4" })}
                      <span className="flex-1">{platformSizes.none.label}</span>
                    </span>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Platform Guidelines - Collapsible on mobile */}
          {platform !== 'none' && (
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-blue-600 text-xs md:text-sm font-medium">
                <Info className="h-3 w-3 md:h-4 md:w-4" />
                {platformSizes[platform].label} Guidelines
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4 group-open:hidden" />
                <ChevronUp className="h-3 w-3 md:h-4 md:w-4 hidden group-open:block" />
              </summary>
              <div className="mt-2 p-2 md:p-3 rounded-2xl border border-blue-200 bg-blue-50">
                <ul className="space-y-1 text-xs">
                  {platformGuidelines[platform].map((guideline, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <CheckCircle className="w-3 h-3 mt-0.5 text-blue-600 shrink-0" />
                      <span className="text-gray-700">{guideline}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          )}

          {/* Main Prompt */}
          <div className="space-y-2">
            <label className="text-xs md:text-sm font-medium text-gray-900">Main Prompt</label>
            <Textarea
              placeholder="Describe your desired image..."
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              className="min-h-[100px] md:min-h-[120px] bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 text-sm resize-none"
            />
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 text-xs text-gray-500 hover:text-gray-600"
              onClick={handleCopyPrompt}
            >
              <FileText className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>

          {/* AI Enhancement Preview - Collapsible */}
          {platform !== 'none' && (
            <div className="p-2 md:p-3 rounded-2xl border border-blue-200 bg-blue-50">
              <div className="flex items-start gap-2">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-600 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-xs md:text-sm font-medium text-gray-900">AI Enhancement Active</p>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {platformEnhancements[platform].slice(0, 3).map((enhancement) => (
                      <Badge key={enhancement} variant="secondary" className="text-[10px] md:text-xs bg-white text-gray-700 border-gray-200 px-1.5 md:px-2 py-0.5">
                        {enhancement}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 p-0 text-xs text-blue-600 hover:text-blue-700"
                    onClick={() => setShowPromptDetails(!showPromptDetails)}
                  >
                    {showPromptDetails ? 'Hide' : 'Show'} details
                    {showPromptDetails ? (
                      <ChevronUp className="w-3 h-3 ml-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
              
              {showPromptDetails && (
                <div className="mt-2 p-2 bg-gray-100 rounded-2xl text-[10px] md:text-xs font-mono text-gray-700 break-words">
                  {(() => {
                    const enhancedMainPrompt = generatePlatformPrompt(platform, 'modern', prompt || '[Your prompt]')
                    return title ? `${title}. ${enhancedMainPrompt}` : enhancedMainPrompt
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="border-red-500/50 bg-red-500/20">
              <AlertDescription className="text-xs md:text-sm text-red-400">
                <div className="flex flex-col gap-2">
                  <span>{error}</span>
                  {(error.includes('upgrade to Pro plan') || error.includes('limit reached')) && (
                    <a 
                      href="/pricing" 
                      className="inline-flex items-center gap-1 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-3 py-1.5 rounded-md font-semibold transition-all transform hover:scale-105 shadow-lg"
                    >
                      <Crown className="w-4 h-4" />
                      Upgrade to Pro
                    </a>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full h-10 md:h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm md:text-lg mt-4 rounded-2xl"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Generate Now
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}