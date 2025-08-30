import { resizeImage, resizeImages } from './image-resizer'

// Mock canvas context for testing
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  fillRect: jest.fn(),
  fillStyle: '#FFFFFF',
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  textAlign: 'center',
  textBaseline: 'middle',
  font: 'bold 16px Arial, sans-serif',
  shadowColor: 'transparent',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  fillText: jest.fn(),
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high'
}))

global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock')

describe('image-resizer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('resizeImage', () => {
    it('should resize a single image to target dimensions using contain mode', async () => {
      const mockImageUrl = 'data:image/png;base64,test'
      const targetWidth = 1920
      const targetHeight = 1080
      
      // Mock Image constructor
      const mockImage = {
        src: '',
        onload: null as any,
        onerror: null as any,
        width: 3000,
        height: 2000,
        crossOrigin: ''
      }
      
      global.Image = jest.fn(() => mockImage) as any
      
      const resizePromise = resizeImage(mockImageUrl, targetWidth, targetHeight)
      
      // Trigger onload
      mockImage.onload()
      
      const result = await resizePromise
      
      expect(result).toBe('data:image/png;base64,mock')
      expect(mockImage.crossOrigin).toBe('anonymous')
      expect(mockImage.src).toBe(mockImageUrl)
    })

    it('should resize image with title overlay', async () => {
      const mockImageUrl = 'data:image/png;base64,test'
      const targetWidth = 1280
      const targetHeight = 720
      const title = 'Test Title'
      
      // Mock Image constructor
      const mockImage = {
        src: '',
        onload: null as any,
        onerror: null as any,
        width: 1920,
        height: 1080,
        crossOrigin: ''
      }
      
      global.Image = jest.fn(() => mockImage) as any
      
      const resizePromise = resizeImage(mockImageUrl, targetWidth, targetHeight, title)
      
      // Trigger onload
      mockImage.onload()
      
      const result = await resizePromise
      
      expect(result).toBe('data:image/png;base64,mock')
      expect(mockImage.crossOrigin).toBe('anonymous')
      expect(mockImage.src).toBe(mockImageUrl)
    })

    it('should handle image loading errors', async () => {
      const mockImageUrl = 'invalid-url'
      const targetWidth = 1920
      const targetHeight = 1080
      
      const mockImage = {
        src: '',
        onload: null as any,
        onerror: null as any,
        crossOrigin: ''
      }
      
      global.Image = jest.fn(() => mockImage) as any
      
      const resizePromise = resizeImage(mockImageUrl, targetWidth, targetHeight)
      
      // Trigger onerror
      mockImage.onerror()
      
      await expect(resizePromise).rejects.toThrow('Failed to load image')
    })

    it('should handle canvas context creation failure', async () => {
      const mockImageUrl = 'data:image/png;base64,test'
      const targetWidth = 1920
      const targetHeight = 1080
      
      // Mock Image constructor
      const mockImage = {
        src: '',
        onload: null as any,
        onerror: null as any,
        width: 3000,
        height: 2000,
        crossOrigin: ''
      }
      
      global.Image = jest.fn(() => mockImage) as any
      
      // Mock getContext to return null
      global.HTMLCanvasElement.prototype.getContext = jest.fn(() => null)
      
      const resizePromise = resizeImage(mockImageUrl, targetWidth, targetHeight)
      
      // Trigger onload
      mockImage.onload()
      
      await expect(resizePromise).rejects.toThrow('Failed to get canvas context')
    })
  })

  describe('resizeImages', () => {
    it('should resize multiple images using contain mode', async () => {
      const mockImageUrls = [
        'data:image/png;base64,test1',
        'data:image/png;base64,test2',
        'data:image/png;base64,test3'
      ]
      const targetWidth = 1280
      const targetHeight = 720
      
      const mockImage = {
        src: '',
        onload: null as any,
        onerror: null as any,
        width: 1920,
        height: 1080,
        crossOrigin: ''
      }
      
      global.Image = jest.fn(() => ({ ...mockImage })) as any
      
      const resizePromise = resizeImages(mockImageUrls, targetWidth, targetHeight)
      
      // Trigger all onload events
      const images = (global.Image as any).mock.instances
      images.forEach((img: any) => img.onload())
      
      const results = await resizePromise
      
      expect(results).toHaveLength(3)
      expect(results.every(r => r === 'data:image/png;base64,mock')).toBe(true)
    })

    it('should resize multiple images with title overlay', async () => {
      const mockImageUrls = [
        'data:image/png;base64,test1',
        'data:image/png;base64,test2'
      ]
      const targetWidth = 1280
      const targetHeight = 720
      const title = 'Test Title'
      
      const mockImage = {
        src: '',
        onload: null as any,
        onerror: null as any,
        width: 1920,
        height: 1080,
        crossOrigin: ''
      }
      
      global.Image = jest.fn(() => ({ ...mockImage })) as any
      
      const resizePromise = resizeImages(mockImageUrls, targetWidth, targetHeight, title)
      
      // Trigger all onload events
      const images = (global.Image as any).mock.instances
      images.forEach((img: any) => img.onload())
      
      const results = await resizePromise
      
      expect(results).toHaveLength(2)
      expect(results.every(r => r === 'data:image/png;base64,mock')).toBe(true)
    })
  })
})