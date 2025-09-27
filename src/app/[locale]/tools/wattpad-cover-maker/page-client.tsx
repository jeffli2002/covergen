'use client'

import React, { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Locale } from '@/lib/i18n/config'
import { Dictionary } from '@/lib/i18n/types'
import { ArrowDown } from 'lucide-react'
import WattpadCoverTool from '@/components/tools/WattpadCoverTool'
import { OptimizedImage } from '@/components/optimized-image'

interface WattpadCoverMakerClientProps {
  locale: Locale
  translations: Dictionary
}

export default function WattpadCoverMakerClient({ locale, translations }: WattpadCoverMakerClientProps) {
  const t = translations?.tools?.wattpadCover || {
    hero: {
      title: 'Wattpad Cover Maker',
      subtitle: 'Design captivating story covers',
      description: 'Create stunning Wattpad covers that attract readers. Perfect 512x800 dimensions for maximum impact.',
      cta: 'Create Your Cover',
      trustText: 'Join thousands of Wattpad authors creating professional covers',
    },
    features: {
      genres: 'All Story Genres',
      customization: 'Genre-Specific Designs',
      fastGeneration: 'Instant Generation'
    }
  }

  // Smooth scroll to generator section
  const scrollToGenerator = useCallback(() => {
    const generatorSection = document.getElementById('generator-section')
    if (generatorSection) {
      generatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const faqs = [
    {
      question: locale === 'zh' ? 'Wattpad 封面的标准尺寸是多少？' : 'What are the standard dimensions for Wattpad covers?',
      answer: locale === 'zh' ? 'Wattpad 封面的推荐尺寸是 512x800 像素。我们的工具自动生成这个尺寸，确保您的封面在所有设备上都能完美显示。' : 'The recommended dimensions for Wattpad covers are 512x800 pixels. Our tool automatically generates covers in this size to ensure they display perfectly across all devices.'
    },
    {
      question: locale === 'zh' ? '我可以为不同类型的故事创建封面吗？' : 'Can I create covers for different story genres?',
      answer: locale === 'zh' ? '是的！我们的工具支持所有 Wattpad 故事类型，包括言情、奇幻、科幻、同人小说、青春文学等。每种类型都有专门的设计风格。' : 'Yes! Our tool supports all Wattpad genres including Romance, Fantasy, Sci-Fi, Fanfiction, Teen Fiction, and more. Each genre has tailored design styles to match your story.'
    },
    {
      question: locale === 'zh' ? '生成的封面是否符合 Wattpad 的内容政策？' : 'Are the generated covers compliant with Wattpad content policies?',
      answer: locale === 'zh' ? '是的，我们的 AI 系统确保所有生成的封面都符合 Wattpad 的内容准则，适合平台上的所有年龄段读者。' : 'Yes, our AI system ensures all generated covers comply with Wattpad\'s content guidelines and are appropriate for all age groups on the platform.'
    },
    {
      question: locale === 'zh' ? '我可以添加自己的角色图片吗？' : 'Can I add my own character images?',
      answer: locale === 'zh' ? '当然可以！您可以上传自己的角色图片或使用我们的 AI 生成独特的角色设计，创建完全定制的故事封面。' : 'Absolutely! You can upload your own character images or use our AI to generate unique character designs for fully customized story covers.'
    },
    {
      question: locale === 'zh' ? '如何让我的封面更吸引读者？' : 'How can I make my cover more appealing to readers?',
      answer: locale === 'zh' ? '使用醒目的标题、选择符合故事氛围的配色、添加吸引人的角色形象。我们的 AI 会根据您选择的故事类型自动优化这些元素。' : 'Use eye-catching titles, choose colors that match your story mood, and include compelling character imagery. Our AI automatically optimizes these elements based on your chosen genre.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Content */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t.hero?.title || 'Wattpad Cover Maker'}
          </h1>
          
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            {t.hero?.subtitle || 'Design captivating story covers'}
          </p>
          
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            {t.hero?.description || 'Create stunning Wattpad covers that attract readers. Perfect 512x800 dimensions for maximum impact.'}
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                20+
              </div>
              <div className="text-sm text-gray-600">
                {t.features?.genres || 'Story Genres'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                100%
              </div>
              <div className="text-sm text-gray-600">
                {t.features?.customization || 'Customizable'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                30s
              </div>
              <div className="text-sm text-gray-600">
                {t.features?.fastGeneration || 'Fast Generation'}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              onClick={scrollToGenerator}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {t.hero?.cta || 'Create Your Cover'}
              <ArrowDown className="ml-2 h-5 w-5" />
            </Button>
            
            {/* Trust Text */}
            <p className="text-sm text-gray-500">
              {t.hero?.trustText || 'Join thousands of Wattpad authors creating professional covers'}
            </p>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section id="generator-section" className="py-12 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <WattpadCoverTool />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {locale === 'zh' ? '为什么选择我们的 Wattpad 封面制作器' : 'Why Choose Our Wattpad Cover Maker'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {locale === 'zh' ? '故事类型优化' : 'Genre-Optimized'}
              </h3>
              <p className="text-gray-600">
                {locale === 'zh' ? '专为不同故事类型设计，从言情到科幻，每个封面都完美契合您的故事风格' : 'Designed for every story type, from Romance to Sci-Fi, each cover perfectly matches your narrative style'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {locale === 'zh' ? '快速生成' : 'Lightning Fast'}
              </h3>
              <p className="text-gray-600">
                {locale === 'zh' ? '在 30 秒内获得专业设计的封面，让您专注于写作而非设计' : 'Get professionally designed covers in under 30 seconds, letting you focus on writing, not designing'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {locale === 'zh' ? '吸引读者' : 'Reader Magnet'}
              </h3>
              <p className="text-gray-600">
                {locale === 'zh' ? '经过优化的设计能够在 Wattpad 的浏览页面中脱颖而出，吸引更多读者' : 'Optimized designs that stand out in Wattpad browsing feeds and attract more readers to your stories'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <article className="prose prose-lg mx-auto">
          <h2>{locale === 'zh' ? '创建引人入胜的 Wattpad 故事封面' : 'Creating Compelling Wattpad Story Covers'}</h2>
          
          <p>
            {locale === 'zh' 
              ? '在 Wattpad 这个拥有数百万故事的平台上，一个吸引人的封面是您的故事脱颖而出的关键。我们的 AI 驱动的 Wattpad 封面制作器专为故事作者设计，帮助您创建专业、吸引人的封面，完美展现您的故事精髓。'
              : 'On Wattpad, where millions of stories compete for attention, an eye-catching cover is crucial for standing out. Our AI-powered Wattpad cover maker is designed specifically for storytellers, helping you create professional, engaging covers that perfectly represent your narrative.'}
          </p>

          <h3>{locale === 'zh' ? '支持所有 Wattpad 故事类型' : 'Supporting All Wattpad Genres'}</h3>
          <p>
            {locale === 'zh'
              ? '无论您写的是浪漫小说、奇幻史诗、科幻冒险还是青春成长故事，我们的工具都能为每种类型提供定制的设计元素。从神秘的黑暗氛围到明亮的浪漫色调，每个封面都经过精心设计以吸引您的目标读者。'
              : 'Whether you\'re writing romance, fantasy epics, sci-fi adventures, or coming-of-age tales, our tool provides genre-specific design elements. From mysterious dark atmospheres to bright romantic tones, each cover is crafted to appeal to your target readers.'}
          </p>

          <h3>{locale === 'zh' ? '完美的 Wattpad 封面尺寸' : 'Perfect Wattpad Cover Dimensions'}</h3>
          <p>
            {locale === 'zh'
              ? '我们的封面制作器自动生成 512x800 像素的图片——Wattpad 官方推荐的尺寸。这确保您的封面在手机、平板和桌面设备上都能清晰显示，不会出现裁剪或失真的问题。'
              : 'Our cover maker automatically generates images at 512x800 pixels—the official Wattpad recommended size. This ensures your cover displays crisp and clear across mobile phones, tablets, and desktop devices without any cropping or distortion issues.'}
          </p>

          <h3>{locale === 'zh' ? 'AI 增强的创意过程' : 'AI-Enhanced Creative Process'}</h3>
          <p>
            {locale === 'zh'
              ? '利用先进的 AI 技术，我们的工具能够理解您的故事元素并生成独特的视觉概念。只需输入您的故事标题、选择类型和描述关键元素，AI 就会创建多个设计选项供您选择。'
              : 'Using advanced AI technology, our tool understands your story elements and generates unique visual concepts. Simply input your story title, select your genre, and describe key elements—the AI will create multiple design options for you to choose from.'}
          </p>

          <h3>{locale === 'zh' ? '提升您的 Wattpad 影响力' : 'Boost Your Wattpad Presence'}</h3>
          <p>
            {locale === 'zh'
              ? '一个专业的封面不仅能吸引新读者，还能建立您作为认真作者的信誉。研究表明，拥有高质量封面的故事获得的阅读量和投票数明显更多。让您的故事获得应有的关注。'
              : 'A professional cover not only attracts new readers but also establishes your credibility as a serious author. Studies show that stories with high-quality covers receive significantly more reads and votes. Give your story the attention it deserves.'}
          </p>
        </article>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              {locale === 'zh' ? '常见问题' : 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}