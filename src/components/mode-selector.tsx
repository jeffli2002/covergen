'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Plus,
  X,
  ImageIcon,
  FileText,
  Sparkles,
  Maximize2,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import ImagePreviewModal from './image-preview-modal'
import { platformSizes, type Platform } from '@/lib/utils'
import { preprocessImageForPlatform } from '@/lib/image-resizer'

interface ModeSelectorProps {
  mode: 'image' | 'text'
  setMode: (mode: 'image' | 'text') => void
  referenceImages: File[]
  setReferenceImages: (images: File[]) => void
  platform?: Platform
}

export default function ModeSelector({ 
  mode, 
  setMode, 
  referenceImages, 
  setReferenceImages,
  platform
}: ModeSelectorProps) {
  const [previewImage, setPreviewImage] = useState<File | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [preprocessedImages, setPreprocessedImages] = useState<string[]>([])
  const [isPreprocessing, setIsPreprocessing] = useState(false)

  const preprocessImages = useCallback(async () => {
    if (!platform || platform === 'none' || referenceImages.length === 0) {
      console.log('❌ Preprocessing skipped - invalid conditions')
      return
    }

    console.log('🚀 Starting preprocessing for platform:', platform, 'with', referenceImages.length, 'images')
    setIsPreprocessing(true)
    
    try {
      const dimensions = platformSizes[platform]
      console.log('📐 Platform dimensions:', dimensions)
      
      // 检查 preprocessImageForPlatform 函数是否可用
      if (typeof preprocessImageForPlatform !== 'function') {
        throw new Error('preprocessImageForPlatform function is not available')
      }
      console.log('✅ preprocessImageForPlatform function is available')
      
      const processed = await Promise.all(
        referenceImages.map(async (file, index) => {
          try {
            console.log(`🖼️ Processing image ${index + 1}/${referenceImages.length}`)
            
            // 将File转换为data URL
            const dataUrl = await fileToDataUrl(file)
            console.log(`📄 Image ${index + 1} converted to data URL, length:`, dataUrl.length)
            
            // 预处理图像
            console.log(`🔧 Calling preprocessImageForPlatform for image ${index + 1}`)
            const processedImage = await preprocessImageForPlatform(dataUrl, dimensions.width, dimensions.height, platform)
            console.log(`✅ Image ${index + 1} processed successfully, length:`, processedImage.length)
            
            // 验证处理后的图像
            if (!processedImage || processedImage.length === 0) {
              throw new Error('Processed image is empty')
            }
            
            return processedImage
          } catch (error) {
            console.error(`❌ Failed to preprocess image ${index + 1}:`, error)
            // 回退到原始图像
            const fallbackImage = await fileToDataUrl(file)
            console.log(`🔄 Image ${index + 1} using fallback, length:`, fallbackImage.length)
            return fallbackImage
          }
        })
      )
      
      console.log('🎉 All images processed successfully:', processed.length)
      console.log('💾 Setting preprocessedImages state:', processed)
      setPreprocessedImages(processed)
      
      // 验证状态更新
      setTimeout(() => {
        console.log('🔍 Current preprocessedImages state after update:', preprocessedImages)
      }, 100)
      
    } catch (error) {
      console.error('❌ Preprocessing failed:', error)
      setPreprocessedImages([])
    } finally {
      setIsPreprocessing(false)
      console.log('🏁 Preprocessing completed')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, referenceImages])

  // 当平台或参考图像变化时，自动预处理图像
  useEffect(() => {
    // 只在开发模式下显示详细日志
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 ModeSelector useEffect triggered:', {
        mode,
        referenceImagesLength: referenceImages.length,
        platform,
        isPreprocessing,
        hasPlatform: !!platform,
        platformNotNone: platform !== 'none',
        shouldPreprocess: mode === 'image' && referenceImages.length > 0 && platform && platform !== 'none'
      })
    }
    
    if (mode === 'image' && referenceImages.length > 0 && platform && platform !== 'none') {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Starting auto-preprocessing for platform:', platform)
      }
      preprocessImages()
    } else {
      // 移除不必要的日志
      setPreprocessedImages([])
    }
  }, [mode, referenceImages, platform, isPreprocessing, preprocessImages])

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
      
      // Validate file sizes (5MB limit)
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

  const openImagePreview = (file: File, index: number) => {
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
    // 如果有预处理后的图像，使用预处理后的图像
    if (preprocessedImages[index] && preprocessedImages[index] !== '') {
      return preprocessedImages[index]
    }
    // 否则使用原始图像
    return URL.createObjectURL(file)
  }

  return (
    <>
      <Card className="h-full bg-white border-gray-200 flex flex-col shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="p-6 space-y-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl">
                <ImageIcon className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Step 1: Input Mode</h3>
            </div>
            <p className="text-sm text-gray-600">Choose your creation method</p>
          </div>

          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              onClick={() => setMode('image')}
              className={cn(
                "flex-1 h-11",
                mode === 'image'
                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              )}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Image to Image
            </Button>
            <Button
              onClick={() => setMode('text')}
              variant="outline"
              className={cn(
                "flex-1 h-11",
                mode === 'text'
                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-orange-500"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              )}
            >
              <FileText className="w-4 h-4 mr-2" />
              Text to Image
            </Button>
          </div>

          {/* Batch Processing Notice */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-900 font-medium">Batch Processing</span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded">PRO</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-blue-600 hover:text-blue-700"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          </div>

          {/* Reference Images */}
          {mode === 'image' && (
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Reference Images</h4>
                <div className="flex items-center gap-2">
                  {isPreprocessing && (
                    <div className="flex items-center gap-1 text-xs text-orange-500">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Processing...
                    </div>
                  )}
                  <span className="text-xs text-gray-500">{referenceImages.length}/9</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 auto-rows-fr">
                {/* Uploaded Images */}
                {referenceImages.map((file, index) => (
                  <div key={index} className="relative aspect-square group">
                    <div 
                      className="w-full h-full rounded-2xl border-2 border-gray-200 bg-gray-50 overflow-hidden relative cursor-pointer hover:border-orange-300 hover:shadow-md transition-all duration-300"
                      onClick={() => openImagePreview(file, index)}
                    >
                      <Image
                        src={getDisplayImage(file, index)}
                        alt={`Reference ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      
                      {/* Preview overlay */}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Preprocessing indicator */}
                      {platform && platform !== 'none' && preprocessedImages[index] && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-500/80 text-black text-xs font-bold rounded">
                          ✓
                        </div>
                      )}
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(index)
                      }}
                      className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full hover:bg-red-600 z-10"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                
                {/* Upload Button */}
                {referenceImages.length < 9 && (
                  <label className="aspect-square cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="w-full h-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-300">
                      <Plus className="w-6 h-6 text-gray-500 mb-1" />
                      <span className="text-xs text-gray-600">Add</span>
                      <span className="text-xs text-gray-500">Max 5MB</span>
                    </div>
                  </label>
                )}
              </div>

              {/* Platform-specific info */}
              {platform && platform !== 'none' && referenceImages.length > 0 && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-orange-400">Platform Preview Active</span>
                  </div>
                  <p className="text-xs text-orange-300">
                    Images are automatically adjusted to {platformSizes[platform].width} × {platformSizes[platform].height}
                  </p>
                  {isPreprocessing && (
                    <p className="text-xs text-orange-300 mt-1">
                      Processing images... Please wait
                    </p>
                  )}
                </div>
              )}

              {mode === 'image' && referenceImages.length === 0 && (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                  <div className="text-center p-4">
                    <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Upload reference images to start</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'text' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-4">
                <FileText className="w-16 h-16 text-orange-500/50 mx-auto mb-3" />
                <p className="text-sm text-gray-700">Text-to-image mode selected</p>
                <p className="text-xs text-gray-600 mt-1">Configure your prompt in the next step</p>
              </div>
            </div>
          )}
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