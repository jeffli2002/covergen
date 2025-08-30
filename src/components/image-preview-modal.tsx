'use client'

import React from 'react'
import { X, Maximize2, Download, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImagePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title?: string
  subtitle?: string
  showDownload?: boolean
  onDownload?: () => void
  imageInfo?: {
    width?: number
    height?: number
    size?: string
    platform?: string
    isPreprocessed?: boolean
  }
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  title = 'Image Preview',
  subtitle,
  showDownload = false,
  onDownload,
  imageInfo
}: ImagePreviewModalProps) {
  if (!isOpen) return null

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    } else {
      // Default download behavior
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `image_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-4xl max-h-[90vh] bg-[#0f0f1a] rounded-2xl border border-orange-500/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Maximize2 className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showDownload && (
              <Button
                onClick={handleDownload}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Image Container */}
        <div className="p-6 flex items-center justify-center">
          <div className="relative max-w-full max-h-[70vh] overflow-hidden rounded-lg border border-gray-700">
            <img
              src={imageUrl}
              alt={title}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        </div>

        {/* Image Info */}
        {imageInfo && (
          <div className="p-4 border-t border-gray-700 bg-gray-900/30">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-orange-500" />
              <h4 className="text-sm font-medium text-white">Image Information</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {imageInfo.width && imageInfo.height && (
                <div>
                  <span className="text-gray-400">Dimensions:</span>
                  <div className="text-white font-mono">
                    {imageInfo.width} × {imageInfo.height}
                  </div>
                </div>
              )}
              
              {imageInfo.size && (
                <div>
                  <span className="text-gray-400">File Size:</span>
                  <div className="text-white">{imageInfo.size}</div>
                </div>
              )}
              
              {imageInfo.platform && (
                <div>
                  <span className="text-gray-400">Platform:</span>
                  <div className="text-white">{imageInfo.platform}</div>
                </div>
              )}
              
              {imageInfo.isPreprocessed !== undefined && (
                <div>
                  <span className="text-gray-400">Status:</span>
                  <div className={`font-medium ${
                    imageInfo.isPreprocessed 
                      ? 'text-green-400' 
                      : 'text-blue-400'
                  }`}>
                    {imageInfo.isPreprocessed ? 'Preprocessed' : 'Original'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
