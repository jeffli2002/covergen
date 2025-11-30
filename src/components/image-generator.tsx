'use client'

import React, { useState } from 'react'
import { platformSizes, type Platform } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useFreeTier } from '@/hooks/useFreeTier'
import { generatePlatformPrompt } from '@/lib/platform-configs'
import { resizeImages } from '@/lib/image-resizer'
import InputPanel from '@/components/input-panel'
import OutputGallery from '@/components/output-gallery'
import AuthForm from '@/components/auth/AuthForm'
import { UpgradePrompt } from '@/components/pricing/UpgradePrompt'
import { useAppStore } from '@/lib/store'
import { PRICING_CONFIG } from '@/config/pricing.config'

export default function ImageGenerator() {
  const [mode, setMode] = useState<'image' | 'text'>('image')
  const [prompt, setPrompt] = useState('')
  const [title, setTitle] = useState('') // Optional title
  const [platform, setPlatform] = useState<Platform>('none')
  const [showPromptDetails, setShowPromptDetails] = useState(false)
  const [referenceImages, setReferenceImages] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'credits' | 'daily_limit' | 'monthly_limit'>('credits')
  const [currentCredits, setCurrentCredits] = useState(0)
  const [requiredCredits, setRequiredCredits] = useState(0)
  const triggerUsageRefresh = useAppStore(state => state.triggerUsageRefresh)
  
  // Custom setMode that also clears generated images
  const handleModeChange = (newMode: 'image' | 'text') => {
    setMode(newMode)
    // Reset generated images when switching modes
    setGeneratedImages([])
    setError(null)
  }
  
  const { user } = useAuth()
  const { canGenerate, getRemainingGenerations, trackUsage, freeTierLimit, usageToday } = useFreeTier()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 9 - referenceImages.length)
      setReferenceImages([...referenceImages, ...newFiles])
      // Reset generated images when new input images are added
      setGeneratedImages([])
      setError(null)
    }
  }

  const removeImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index))
    // Reset generated images when input images are removed
    setGeneratedImages([])
    setError(null)
  }

  const handleGenerate = async () => {
    console.log('Generate button clicked!')
    console.log('Mode:', mode, 'Prompt:', prompt, 'Reference images:', referenceImages.length)
    
    if (!prompt.trim() || (mode === 'image' && referenceImages.length === 0)) {
      console.log('Validation failed - missing prompt or images')
      return
    }
    
    // Check authentication first - unauthenticated users should see sign-in modal
    if (!user) {
      console.log('User not authenticated, showing auth modal')
      setShowAuthModal(true)
      return
    }
    
    // For authenticated users, check if they can generate (credit check happens on backend)
    if (!canGenerate()) {
      setShowUpgradeModal(true)
      return
    }
    
    console.log('Starting generation...')
    setIsGenerating(true)
    setGeneratedImages([]) // Clear previous results
    setError(null) // Clear any previous errors
    
    try {
      // Generate enhanced prompt for the selected platform
      // Pass title and prompt correctly to generatePlatformPrompt
      const enhancedPrompt = generatePlatformPrompt(platform, 'modern', title || '', prompt)
      
      let imagesToSend: string[] = []
      
      if (mode === 'image' && referenceImages.length > 0) {
        if (platform !== 'none') {
          // 使用预处理后的图像进行AI生成
          // 这样AI生成时就会基于已经剪裁好的图像，而不是原图
          const dimensions = platformSizes[platform]
          console.log('Using preprocessed images for AI generation:', platform, 'dimensions:', dimensions)
          
          // 预处理所有参考图像
          const { preprocessImageForPlatform } = await import('@/lib/image-resizer')
          imagesToSend = await Promise.all(
            referenceImages.map(async (file) => {
              try {
                // 将File转换为data URL
                const dataUrl = await new Promise<string>((resolve) => {
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    resolve(reader.result as string)
                  }
                  reader.readAsDataURL(file)
                })
                
                // 预处理图像
                return await preprocessImageForPlatform(dataUrl, dimensions.width, dimensions.height, platform)
              } catch (error) {
                console.warn('Failed to preprocess image for AI generation:', error)
                // 如果预处理失败，回退到原图
                return new Promise<string>((resolve) => {
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    resolve(reader.result as string)
                  }
                  reader.readAsDataURL(file)
                })
              }
            })
          )
          console.log('Preprocessing completed for AI generation')
        } else {
          // 如果没有选择平台，使用原图
          imagesToSend = await Promise.all(
            referenceImages.map(async (file) => {
              return new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => {
                  resolve(reader.result as string)
                }
                reader.readAsDataURL(file)
              })
            })
          )
        }
      }

      // Call the API with preprocessed images
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin', // Include cookies in the request
        body: JSON.stringify({
          prompt: enhancedPrompt,
          referenceImages: mode === 'image' ? imagesToSend : undefined,
          mode,
          style: 'modern',
          platform,
          dimensions: platformSizes[platform],
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to generate images'
        let errorData: any = null
        
        try {
          errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If we can't parse the error, use status-based messages
        }
        
        // Handle specific error cases
        if (response.status === 413) {
          throw new Error('Images are too large. Our compression reduced them but they\'re still too big. Please use smaller source images (under 5MB each).')
        } else if (response.status === 402) {
          // Handle insufficient credits - show upgrade modal with credit details
          const cost = PRICING_CONFIG.generationCosts.nanoBananaImage
          setRequiredCredits(cost)
          setCurrentCredits(errorData.currentBalance || 0)
          setUpgradeReason('credits')
          setShowUpgradeModal(true)
          throw new Error(errorData.error || 'Insufficient credits for image generation')
        } else if (response.status === 429) {
          // All 429 errors should show upgrade modal
          // Both usage limits and rate limits can be resolved by upgrading tiers
          if (errorData?.limit_reached) {
            // Set appropriate upgrade reason based on limit type
            if (errorData.limit_type === 'daily') {
              setUpgradeReason('daily_limit')
            } else if (errorData.limit_type === 'monthly') {
              setUpgradeReason('monthly_limit')
            } else {
              setUpgradeReason('credits')
            }
            setShowUpgradeModal(true)
            throw new Error(errorData.error || 'Daily generation limit reached. Please try again tomorrow or upgrade to Pro plan.')
          }
          throw new Error('Rate limit exceeded. Please wait a few minutes or upgrade for higher rate limits.')
        } else if (response.status === 401) {
          throw new Error('API authentication failed. Please contact support.')
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // 由于AI生成时已经使用了预处理后的图像，这里不需要再次resize
      // 直接使用AI生成的图像
      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images)
        // Track usage for free tier
        await trackUsage()
        // Trigger usage refresh to update the header display
        triggerUsageRefresh()
      } else {
        setGeneratedImages(data.images || [])
      }
    } catch (error) {
      console.error('Generation error:', error)
      // Use the actual error message if available
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate images. Please try again.'
      setError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    setDownloadingId(`image_${index}`)
    
    try {
      // If it's a data URL, download directly
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = `generated_image_${index + 1}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
        // For URLs, fetch the image and convert to blob
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `generated_image_${index + 1}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Download error:', error)
      setError('Failed to download image')
    } finally {
      setDownloadingId(null)
    }
  }

  const canGenerateButton = prompt.trim() && 
    (mode === 'text' || (mode === 'image' && referenceImages.length > 0))

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      {/* Mobile Layout - Stacked */}
      <div className="lg:hidden space-y-6">
        <InputPanel
          mode={mode}
          setMode={handleModeChange}
          referenceImages={referenceImages}
          setReferenceImages={setReferenceImages}
          title={title}
          setTitle={setTitle}
          platform={platform}
          setPlatform={setPlatform}
          prompt={prompt}
          setPrompt={setPrompt}
          showPromptDetails={showPromptDetails}
          setShowPromptDetails={setShowPromptDetails}
          isGenerating={isGenerating}
          canGenerate={!!canGenerateButton}
          onGenerate={handleGenerate}
          error={error}
        />
        
        <OutputGallery
          generatedImages={generatedImages}
          downloadingId={downloadingId}
          onDownload={handleDownload}
          onGenerateNew={() => setGeneratedImages([])}
          isGenerating={isGenerating}
          platform={platform}
        />
      </div>

      {/* Desktop Layout - 2 Columns */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6 min-h-[600px]">
        {/* Left Column: Input Panel */}
        <div className="flex flex-col">
          <InputPanel
            mode={mode}
            setMode={handleModeChange}
            referenceImages={referenceImages}
            setReferenceImages={setReferenceImages}
            title={title}
            setTitle={setTitle}
            platform={platform}
            setPlatform={setPlatform}
            prompt={prompt}
            setPrompt={setPrompt}
            showPromptDetails={showPromptDetails}
            setShowPromptDetails={setShowPromptDetails}
            isGenerating={isGenerating}
            canGenerate={!!canGenerateButton}
            onGenerate={handleGenerate}
            error={error}
          />
        </div>
        
        {/* Right Column: Output Gallery */}
        <div className="flex flex-col">
          <OutputGallery
            generatedImages={generatedImages}
            downloadingId={downloadingId}
            onDownload={handleDownload}
            onGenerateNew={() => setGeneratedImages([])}
            isGenerating={isGenerating}
            platform={platform}
          />
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthForm 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Upgrade Modal - For both credit and limit errors */}
      {showUpgradeModal && (
        <UpgradePrompt 
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason={upgradeReason}
          currentCredits={currentCredits}
          requiredCredits={requiredCredits}
          generationType="nanoBananaImage"
        />
      )}
    </div>
  )
}