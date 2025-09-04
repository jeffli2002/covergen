'use client'

import Image from 'next/image'
import { Music, Sparkles, Zap, Palette, Play, Headphones, Radio, Heart } from 'lucide-react'

interface Props {
  locale: string
}

export default function SpotifyPlaylistCoverContent({ locale }: Props) {

  const features = [
    {
      icon: <Music className="w-6 h-6" />,
      title: 'Perfect 300x300 Size',
      description: 'Automatically sized for Spotify playlist requirements',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-Powered Designs',
      description: 'Generate unique covers based on your playlist mood',
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: 'Spotify Canvas Maker',
      description: 'Create looping 9:16 videos for Spotify Canvas',
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Genre-Based Styles',
      description: 'Templates for every music genre and mood',
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: 'Apple Music Compatible',
      description: 'Works for Apple Music and other streaming platforms',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Generation',
      description: 'Create professional covers in seconds',
    },
  ]

  const genres = [
    { name: 'Hip Hop', style: 'Bold typography, urban aesthetics, graffiti elements' },
    { name: 'Lo-Fi', style: 'Anime characters, cozy rooms, vintage filters' },
    { name: 'EDM', style: 'Neon colors, geometric patterns, futuristic designs' },
    { name: 'Rock', style: 'Dark themes, band imagery, vintage concert posters' },
    { name: 'Pop', style: 'Bright colors, modern graphics, trendy aesthetics' },
    { name: 'Classical', style: 'Elegant typography, minimal design, sophisticated imagery' },
    { name: 'Jazz', style: 'Vintage instruments, art deco style, classic album aesthetics' },
    { name: 'R&B', style: 'Smooth gradients, romantic themes, contemporary style' },
  ]

  const useCases = [
    {
      title: 'Personal Playlists',
      description: 'Make your daily mixes and mood playlists stand out',
      icon: <Heart className="w-8 h-8 text-green-500" />,
    },
    {
      title: 'DJ Sets & Mixes',
      description: 'Professional covers for your DJ mixes and sets',
      icon: <Radio className="w-8 h-8 text-green-500" />,
    },
    {
      title: 'Music Curators',
      description: 'Brand your curated playlists with consistent style',
      icon: <Headphones className="w-8 h-8 text-green-500" />,
    },
    {
      title: 'Artists & Bands',
      description: 'Create cohesive visual identity for your music',
      icon: <Music className="w-8 h-8 text-green-500" />,
    },
  ]

  return (
    <div className="py-16 space-y-24">
      {/* Features Section */}
      <section id="features" className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">The Ultimate Spotify Playlist Cover Maker</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create stunning playlist artwork that matches your music vibe. Also works as a Spotify Canvas maker for dynamic visuals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Genre Styles */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Genre-Specific Design Styles
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {genres.map((genre) => (
              <div key={genre.name} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2 text-green-600">{genre.name}</h3>
                <p className="text-sm text-gray-600">{genre.style}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Who Uses Our Spotify Cover Maker?</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                {useCase.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
              <p className="text-gray-600">{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tutorial Section */}
      <section className="bg-gradient-to-br from-green-50 to-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How to Create Perfect Spotify Playlist Covers
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Choose Your Style</h3>
                    <p className="text-gray-600">
                      Select from genre-specific templates or let AI suggest based on your playlist name and mood.
                      Our Spotify Canvas maker option creates dynamic visuals.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Customize Your Design</h3>
                    <p className="text-gray-600">
                      Add your playlist title, adjust colors, and fine-tune the mood. Perfect 300x300 sizing is automatic.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Download & Upload</h3>
                    <p className="text-gray-600">
                      Download your cover in perfect Spotify dimensions. Upload directly to Spotify desktop app or use for Apple Music.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose CoverGen Pro for Spotify Covers?
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-green-500">
            <h3 className="text-xl font-semibold mb-6 text-green-600">CoverGen Pro Advantages</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Free Spotify playlist covers with no watermarks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Spotify Canvas maker included for dynamic visuals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>AI-powered genre and mood detection</span>
                </li>
              </ul>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Perfect 300x300 auto-sizing every time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Instant generation with no design skills needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Works on all devices - mobile and desktop</span>
                </li>
              </ul>
            </div>
            <p className="mt-6 text-gray-600 text-center">
              Unlike traditional design tools that require subscriptions and design expertise, 
              CoverGen Pro makes professional Spotify cover creation accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pro Tips for Spotify Playlist Covers
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3 text-green-400">Design Tips</h3>
              <ul className="space-y-2 text-white/80">
                <li>• Use high contrast for mobile visibility</li>
                <li>• Keep text minimal and readable at small sizes</li>
                <li>• Match cover mood to playlist vibe</li>
                <li>• Use consistent style across playlists</li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3 text-green-400">Technical Tips</h3>
              <ul className="space-y-2 text-white/80">
                <li>• Always use 300x300 pixels</li>
                <li>• Keep file size under 4MB</li>
                <li>• Use JPG or PNG format only</li>
                <li>• Test on mobile before uploading</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-green-600 to-black rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make Your Playlists Stand Out?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Create professional Spotify playlist covers in seconds. Works as a Spotify Canvas maker too!
          </p>
          <a
            href="#tool"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-700 transition-all transform hover:scale-105"
          >
            <Music className="w-5 h-5" />
            Create Your Playlist Cover
          </a>
        </div>
      </section>
    </div>
  )
}