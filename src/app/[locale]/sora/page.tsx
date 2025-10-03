import { Metadata } from 'next'
import SoraVideoGenerator from '@/components/sora-video-generator'
import { Locale } from '@/lib/i18n/config'

export const metadata: Metadata = {
  title: 'Sora 2 Video Generator | AI-Powered Text-to-Video',
  description: 'Generate stunning videos from text prompts using Sora 2, the latest AI video generation model. Create professional videos in seconds with advanced AI technology.',
  keywords: ['Sora 2', 'AI video generation', 'text to video', 'AI video maker', 'video generator', 'Sora AI'],
}

export default function SoraPage({
  params,
}: {
  params: { locale: Locale }
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin tracking-tight mb-6 text-gray-900">
              Sora 2 Video Generator
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 font-light leading-relaxed">
              Transform your ideas into stunning videos with AI-powered text-to-video generation
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl px-6 py-3 border border-purple-200 shadow-sm inline-block">
              <p className="text-base md:text-lg font-light text-purple-800">
                🎬 Powered by Sora 2 • Latest AI Technology • Professional Quality
              </p>
            </div>
          </div>

          <SoraVideoGenerator />

          <div className="max-w-4xl mx-auto mt-16 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-light mb-8 text-gray-900">
                How It Works
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="text-lg font-medium mb-2">1. Write Your Prompt</h3>
                <p className="text-gray-600">
                  Describe the video you want to create. Be specific about scenes, actions, and details.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-lg font-medium mb-2">2. Choose Settings</h3>
                <p className="text-gray-600">
                  Select aspect ratio (landscape/portrait) and quality (standard/HD) for your video.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">🎥</div>
                <h3 className="text-lg font-medium mb-2">3. Generate Video</h3>
                <p className="text-gray-600">
                  Click generate and watch as AI creates your professional video in minutes.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
              <h3 className="text-xl font-medium mb-4 text-gray-900">Features</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Landscape & Portrait Modes:</strong> Choose the perfect aspect ratio for your platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>HD Quality:</strong> Generate videos in standard or high-definition quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Advanced AI:</strong> Powered by Sora 2, the latest text-to-video model</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Easy Download:</strong> Download your generated videos instantly</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-200">
              <h3 className="text-xl font-medium mb-4 text-gray-900">Tips for Better Results</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">💡</span>
                  <span>Be specific and detailed in your prompt description</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">💡</span>
                  <span>Describe camera movements, lighting, and atmosphere</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">💡</span>
                  <span>Include character actions and emotions for better results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">💡</span>
                  <span>Use HD quality for professional or commercial projects</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
