'use client'

interface YouTubeThumbnailIdeasClientProps {
  locale: string
  translations: any
}

export default function YouTubeThumbnailIdeasClient({ locale, translations }: YouTubeThumbnailIdeasClientProps) {
  const isZh = locale === 'zh'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          {isZh ? 'YouTube 缩略图创意大全' : 'YouTube Thumbnail Ideas'}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
          {isZh 
            ? '发现数百个 YouTube 缩略图创意和设计灵感'
            : 'Discover hundreds of YouTube thumbnail ideas and design inspiration'}
        </p>
        {/* Placeholder content */}
        <div className="text-center py-20">
          <p className="text-gray-500">Content coming soon...</p>
        </div>
      </div>
    </div>
  )
}