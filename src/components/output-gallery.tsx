'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { 
  Download, 
  Loader2,
  ImageIcon,
  Sparkles,
  RefreshCw,
  Maximize2
} from 'lucide-react'
import ImagePreviewModal from './image-preview-modal'

interface OutputGalleryProps {
  generatedImages: string[]
  downloadingId: string | null
  onDownload: (imageUrl: string, index: number) => void
  onGenerateNew: () => void
  isGenerating?: boolean
  platform?: string
}

export default function OutputGallery({
  generatedImages,
  downloadingId,
  onDownload,
  onGenerateNew,
  isGenerating = false,
  platform
}: OutputGalleryProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setIsPreviewOpen(true)
  }

  const closeImagePreview = () => {
    setIsPreviewOpen(false)
    setPreviewImage(null)
  }

  const getImageInfo = (imageUrl: string) => {
    // Try to get image dimensions from the image
    const img = new Image()
    img.src = imageUrl
    
    return {
      platform: platform && platform !== 'none' ? platform : 'None',
      isPreprocessed: true, // Generated images are preprocessed
      size: 'Generated' // We don't have file size for generated images
    }
  }

  return (
    <>
      <Card className="h-full bg-white border-gray-200 flex flex-col shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 md:p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
                <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">Output Gallery</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600">Your AI creations appear here</p>
          </div>

          {/* Results Area */}
          <div className="flex-1 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
            {isGenerating ? (
              <div className="text-center p-4">
                <div className="w-12 h-12 md:w-16 md:h-16 mb-3 rounded-2xl bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center mx-auto">
                  <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-orange-600 animate-spin" />
                </div>
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2">Generating your image...</h4>
                <p className="text-xs md:text-sm text-gray-600">This usually takes 5-10 seconds</p>
                <div className="mt-3 w-32 md:w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            ) : generatedImages.length === 0 ? (
              <div className="text-center p-4">
                <div className="w-12 h-12 md:w-20 md:h-20 mb-3 md:mb-4 rounded-2xl bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-6 h-6 md:w-10 md:h-10 text-orange-600" />
                </div>
                <h4 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Ready for generation</h4>
                <p className="text-xs md:text-sm text-gray-600">Configure your prompt and hit generate</p>
              </div>
            ) : (
              <div className="w-full max-w-md p-4 md:p-6">
                {/* Image Container */}
                <div 
                  className="bg-white rounded-2xl p-3 md:p-4 border-2 border-orange-200 shadow-lg cursor-pointer hover:border-orange-300 hover:shadow-xl transition-all duration-300 group"
                  onClick={() => openImagePreview(generatedImages[0])}
                >
                  <div className="relative">
                    <img
                      src={generatedImages[0]}
                      alt="Generated image"
                      className="w-full h-auto rounded max-h-[250px] md:max-h-[300px] object-contain"
                    />
                    
                    {/* Preview overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center rounded">
                      <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
                  <Button
                    onClick={() => onDownload(generatedImages[0], 0)}
                    disabled={downloadingId === `image_0`}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm h-8 md:h-10"
                  >
                    {downloadingId === `image_0` ? (
                      <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin mr-1 md:mr-2" />
                    ) : (
                      <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    )}
                    Download
                  </Button>
                  
                  <Button
                    onClick={onGenerateNew}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-xs md:text-sm h-8 md:h-10"
                  >
                    <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    New
                  </Button>
                </div>
                
                {/* Image info */}
                <div className="mt-3 md:mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Generated Image</span>
                    {platform && platform !== 'none' && (
                      <span className="px-2 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-600 rounded text-xs">
                        {platform}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Click image to preview details
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pro Features Notice */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-900 font-medium">Advanced Features</span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded">PRO</span>
            </div>
            <Link href="/pricing">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-blue-600 hover:text-blue-700"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          isOpen={isPreviewOpen}
          onClose={closeImagePreview}
          imageUrl={previewImage}
          title="Generated Image Preview"
          subtitle="AI-generated image with platform-specific dimensions"
          showDownload={true}
          onDownload={() => onDownload(previewImage, 0)}
          imageInfo={getImageInfo(previewImage)}
        />
      )}
    </>
  )
}