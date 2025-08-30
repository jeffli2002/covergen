export async function resizeImage(
  imageUrl: string,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      canvas.width = targetWidth
      canvas.height = targetHeight
      
      // Calculate scaling to cover the entire canvas while maintaining aspect ratio
      const imgAspectRatio = img.width / img.height
      const canvasAspectRatio = targetWidth / targetHeight
      
      let drawWidth: number
      let drawHeight: number
      let offsetX = 0
      let offsetY = 0
      
      if (imgAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas ratio, fit by height
        drawHeight = targetHeight
        drawWidth = drawHeight * imgAspectRatio
        offsetX = -(drawWidth - targetWidth) / 2
      } else {
        // Image is taller than canvas ratio, fit by width
        drawWidth = targetWidth
        drawHeight = drawWidth / imgAspectRatio
        offsetY = -(drawHeight - targetHeight) / 2
      }
      
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Draw the image to cover the entire canvas
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      
      // Convert to data URL
      const resizedDataUrl = canvas.toDataURL('image/png', 0.95)
      resolve(resizedDataUrl)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = imageUrl
  })
}

export async function resizeImages(
  imageUrls: string[],
  targetWidth: number,
  targetHeight: number
): Promise<string[]> {
  const resizePromises = imageUrls.map(url => 
    resizeImage(url, targetWidth, targetHeight)
  )
  return Promise.all(resizePromises)
}

// 修复后的智能剪裁算法 - 确保保留人物头部和上半身
function calculateAdvancedSmartCrop(
  srcWidth: number,
  srcHeight: number,
  targetWidth: number,
  targetHeight: number
): { cropX: number; cropY: number; cropWidth: number; cropHeight: number } {
  const srcAspectRatio = srcWidth / srcHeight
  const targetAspectRatio = targetWidth / targetHeight
  
  let cropWidth: number, cropHeight: number, cropX: number, cropY: number
  
  if (srcAspectRatio > targetAspectRatio) {
    // 源图像更宽，需要剪裁宽度
    cropHeight = srcHeight
    cropWidth = srcHeight * targetAspectRatio
    
    // 智能定位：优先保留人物头部和上半身
    // 对于人物图像，头部通常在图像上半部分，身体在中心
    // 我们应该从图像中心开始剪裁，确保人物完整
    const availableCropRange = srcWidth - cropWidth
    
    if (availableCropRange > 0) {
      // 从图像中心开始剪裁，确保人物头部和上半身完整
      // 人物通常在图像中心，所以从中心开始剪裁
      cropX = availableCropRange * 0.5 // 从50%位置开始，居中剪裁
    } else {
      cropX = 0
    }
    
    cropY = 0
  } else {
    // 源图像更高，需要剪裁高度
    cropWidth = srcWidth
    cropHeight = srcWidth / targetAspectRatio
    
    // 智能定位：优先保留人物头部和上半身
    // 对于人物图像，头部在图像顶部，身体向下延伸
    // 我们应该从图像顶部开始剪裁，确保头部完整
    const availableCropRange = srcHeight - cropHeight
    
    if (availableCropRange > 0) {
      // 从图像顶部开始剪裁，确保人物头部完整
      // 人物头部通常在图像顶部，所以从顶部开始
      cropY = 0 // 从顶部开始，保留头部
    } else {
      cropY = 0
    }
    
    cropX = 0
  }
  
  // 确保剪裁区域不超出源图像边界
  cropX = Math.max(0, Math.min(cropX, srcWidth - cropWidth))
  cropY = Math.max(0, Math.min(cropY, srcHeight - cropHeight))
  
  return { cropX, cropY, cropWidth, cropHeight }
}

export async function preprocessImageForPlatform(
  imageUrl: string,
  targetWidth: number,
  targetHeight: number,
  platform: string
): Promise<string> {
  console.log('preprocessImageForPlatform called with:', {
    imageUrl: imageUrl.substring(0, 100) + '...',
    targetWidth,
    targetHeight,
    platform
  })
  
  return new Promise((resolve, reject) => {
    try {
      // 检查浏览器环境
      if (typeof window === 'undefined') {
        throw new Error('Window is not available - running in server environment')
      }
      
      if (typeof Image === 'undefined') {
        throw new Error('Image constructor is not available')
      }
      
      if (typeof document === 'undefined') {
        throw new Error('Document is not available')
      }
      
      console.log('Browser environment check passed')
      
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          console.log('Image loaded successfully:', {
            originalWidth: img.width,
            originalHeight: img.height,
            targetWidth,
            targetHeight
          })
          
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) { 
            reject(new Error('Failed to get canvas context'))
            return 
          }
          
          console.log('Canvas context created successfully')
          
          // 直接使用目标尺寸，不添加任何填充
          canvas.width = targetWidth
          canvas.height = targetHeight
          
          console.log('Canvas dimensions set:', { width: canvas.width, height: canvas.height })
          
          // 使用修复后的智能剪裁算法，确保保留人物头部和上半身
          const cropParams = calculateAdvancedSmartCrop(
            img.width, img.height, targetWidth, targetHeight
          )
          
          console.log('Crop parameters calculated:', cropParams)
          
          // 启用图像平滑
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // 直接将剪裁后的图像绘制到画布，填满整个目标尺寸
          // 不使用drawX和drawY偏移，确保图像完全填满画布
          ctx.drawImage(
            img,
            cropParams.cropX, cropParams.cropY, cropParams.cropWidth, cropParams.cropHeight,  // 源图像剪裁区域
            0, 0, targetWidth, targetHeight       // 目标画布位置，填满整个画布
          )
          
          console.log('Image drawn to canvas successfully')
          
          const result = canvas.toDataURL('image/png', 0.95)
          console.log('Canvas converted to data URL, length:', result.length)
          
          resolve(result)
        } catch (error) {
          console.error('Error in image processing:', error)
          reject(error)
        }
      }
      
      img.onerror = (error) => { 
        console.error('Image failed to load:', error)
        reject(new Error('Failed to load image')) 
      }
      
      console.log('Setting image source:', imageUrl.substring(0, 100) + '...')
      img.src = imageUrl
      
    } catch (error) {
      console.error('Error in preprocessImageForPlatform:', error)
      reject(error)
    }
  })
}