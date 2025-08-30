'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Edit3, Share2, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { platformSizes } from '@/lib/utils'
import Image from 'next/image'

export default function ResultsGallery() {
  const { currentTask } = useAppStore()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  
  if (!currentTask) return null

  const handleDownload = async (imageUrl: string, index: number) => {
    setDownloadingId(`${currentTask.id}_${index}`)
    
    // Simulate download processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Trigger actual download
    const link = document.createElement('a')
    link.href = imageUrl
    const platformConfig = platformSizes[currentTask.platform]
    link.download = `${currentTask.title.substring(0, 30)}_${platformConfig.label}_${index + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setDownloadingId(null)
  }

  const handleEdit = (imageUrl: string, index: number) => {
    // TODO: Open image editor modal
    console.log('Edit image:', imageUrl, index)
  }

  const handleShare = (imageUrl: string, index: number) => {
    // TODO: Open sharing modal
    if (navigator.share) {
      navigator.share({
        title: currentTask.title,
        text: 'Check out my AI-generated cover!',
        url: imageUrl
      })
    }
  }

  if (currentTask.status === 'processing') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-medium mb-2">Generating your covers...</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Our AI is creating multiple cover options for "{currentTask.title}". 
            This usually takes 5-10 seconds.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (currentTask.status === 'failed') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-medium text-destructive mb-2">Generation Failed</h3>
          <p className="text-muted-foreground">
            Something went wrong while generating your covers. Please try again.
          </p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (currentTask.status === 'completed' && currentTask.results.length > 0) {
    const platformConfig = platformSizes[currentTask.platform]
    
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Generated Covers</h3>
            <p className="text-muted-foreground">
              {currentTask.results.length} covers generated for "{currentTask.title}" 
              ({platformConfig.label})
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTask.results.map((imageUrl, index) => (
              <div key={index} className="group relative">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
                  {/* Mock image placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-lg font-bold mb-1">{currentTask.title}</div>
                      <div className="text-sm opacity-80">AI Generated Cover #{index + 1}</div>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(imageUrl, index)}
                      className="flex-1"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleDownload(imageUrl, index)}
                      disabled={downloadingId === `${currentTask.id}_${index}`}
                      className="flex-1"
                    >
                      {downloadingId === `${currentTask.id}_${index}` ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <Download className="w-3 h-3 mr-1" />
                      )}
                      {downloadingId === `${currentTask.id}_${index}` ? 'Processing...' : 'Download'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(imageUrl, index)}
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Download indicator */}
                {downloadingId === `${currentTask.id}_${index}` && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">Processing download...</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" onClick={() => useAppStore.getState().setCurrentTask(null)}>
              Generate New Covers
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}