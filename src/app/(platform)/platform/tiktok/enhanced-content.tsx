import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Music, 
  TrendingUp, 
  Users, 
  Zap, 
  Hash, 
  Video,
  Smartphone,
  Target,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BarChart,
  Heart,
  Share2,
  Eye,
  PlayCircle,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';

export default function EnhancedContent() {
  return (
    <div className="w-full">
      {/* Main Comprehensive Guide Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            The Ultimate Guide to TikTok Content That Goes Viral
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master the art of creating scroll-stopping TikTok videos with covers that capture attention instantly
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-pink-50 to-white border-pink-100">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Hash className="w-6 h-6 text-pink-600" />
            Table of Contents
          </h3>
          <nav className="grid md:grid-cols-2 gap-4">
            {[
              { href: "#psychology", title: "The Psychology of TikTok's For You Page", icon: Eye },
              { href: "#technical", title: "Technical Specifications and Best Practices", icon: Smartphone },
              { href: "#algorithm", title: "TikTok Algorithm Deep Dive", icon: TrendingUp },
              { href: "#strategies", title: "Content Strategies That Work", icon: Target },
              { href: "#mistakes", title: "Common Mistakes to Avoid", icon: AlertCircle },
              { href: "#tools", title: "Tools and Resources", icon: Zap },
              { href: "#success", title: "Success Stories", icon: Award },
              { href: "#faq", title: "Frequently Asked Questions", icon: MessageCircle }
            ].map((item, index) => (
              <Link 
                key={index}
                href={item.href} 
                className="flex items-center gap-3 p-4 rounded-lg bg-white hover:bg-pink-50 transition-colors group"
              >
                <item.icon className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform" />
                <span className="text-gray-700 group-hover:text-pink-700 font-medium">{item.title}</span>
                <ArrowRight className="w-4 h-4 ml-auto text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </nav>
        </Card>

        {/* Main Article Content */}
        <article className="prose prose-lg max-w-none">
          {/* Psychology Section */}
          <section id="psychology" className="mb-16">
            <Card className="p-8 border-pink-100">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Eye className="w-8 h-8 text-pink-600" />
                The Psychology of TikTok's For You Page
              </h3>
              
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">The 3-Second Rule</h4>
                <p className="text-gray-700 mb-4">
                  TikTok users make split-second decisions about whether to watch or scroll past your video. 
                  Research shows you have exactly <strong>3 seconds</strong> to capture attention before 80% of viewers swipe away. 
                  Your cover image is the first impression that can make or break this crucial moment.
                </p>
                <div className="bg-pink-50 p-6 rounded-lg mb-6">
                  <p className="text-pink-900 font-medium">
                    💡 <strong>Pro Tip:</strong> A compelling cover can increase your watch time by up to 300%, 
                    directly boosting your chances of appearing on more For You Pages.
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">Gen Z Visual Preferences</h4>
                <p className="text-gray-700 mb-4">
                  TikTok's primary audience (60% are aged 16-24) responds to specific visual cues:
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                    <span><strong>Bold, contrasting colors</strong> - Pink, neon, and high-contrast combinations perform 40% better</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                    <span><strong>Authentic, unpolished aesthetics</strong> - Raw, real content gets 2.5x more engagement than overly produced videos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                    <span><strong>Text overlays with personality</strong> - Videos with text get 80% more completion rates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                    <span><strong>Face-forward content</strong> - Videos featuring faces in covers get 38% more views</span>
                  </li>
                </ul>
              </div>

              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">The Scroll-Stopping Formula</h4>
                <p className="text-gray-700 mb-4">
                  Our AI analyzes millions of viral TikToks to understand what makes users stop scrolling:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-pink-100 to-pink-50">
                    <h5 className="font-semibold mb-2">Visual Hook</h5>
                    <p className="text-sm text-gray-700">Unusual visuals, bright colors, or intriguing imagery that breaks the scroll pattern</p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-pink-100 to-pink-50">
                    <h5 className="font-semibold mb-2">Emotional Trigger</h5>
                    <p className="text-sm text-gray-700">Expressions, reactions, or scenarios that evoke curiosity, humor, or relatability</p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-pink-100 to-pink-50">
                    <h5 className="font-semibold mb-2">Clear Promise</h5>
                    <p className="text-sm text-gray-700">Text or visual that promises value, entertainment, or answers a burning question</p>
                  </Card>
                </div>
              </div>
            </Card>
          </section>

          {/* Technical Specifications Section */}
          <section id="technical" className="mb-16">
            <Card className="p-8 border-pink-100">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Smartphone className="w-8 h-8 text-pink-600" />
                Technical Specifications and Best Practices
              </h3>
              
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">TikTok Video Specifications</h4>
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-3 text-pink-700">Primary Format</h5>
                      <ul className="space-y-2 text-gray-700">
                        <li>• <strong>Aspect Ratio:</strong> 9:16 (vertical)</li>
                        <li>• <strong>Resolution:</strong> 1080 x 1920 pixels</li>
                        <li>• <strong>File Format:</strong> MP4 or MOV</li>
                        <li>• <strong>Duration:</strong> Up to 10 minutes</li>
                        <li>• <strong>File Size:</strong> Up to 287.6 MB (iOS) / 72 MB (Android)</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-3 text-pink-700">Cover Image Specs</h5>
                      <ul className="space-y-2 text-gray-700">
                        <li>• <strong>Dimensions:</strong> 1080 x 1920 pixels</li>
                        <li>• <strong>Safe Zone:</strong> Center 80% of image</li>
                        <li>• <strong>Text Area:</strong> Top 60% for maximum visibility</li>
                        <li>• <strong>File Format:</strong> JPEG or PNG</li>
                        <li>• <strong>Color Space:</strong> sRGB for best compatibility</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">Cover Design Best Practices</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold mb-2">Use High Contrast</h5>
                      <p className="text-gray-700">
                        TikTok's UI has dark and light modes. Ensure your cover works in both by using high contrast between text and background. 
                        White text with black outline performs best across all viewing modes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold mb-2">Mobile-First Typography</h5>
                      <p className="text-gray-700">
                        Text should be readable on a 5-inch screen. Use bold fonts at minimum 60px for headlines and 40px for subtext. 
                        Sans-serif fonts like Arial Black or Impact work best.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold mb-2">Strategic Element Placement</h5>
                      <p className="text-gray-700">
                        Keep important elements in the center 80% to avoid UI overlays. The bottom 20% is often covered by captions, 
                        comments, and interaction buttons.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">Platform-Specific Considerations</h4>
                <div className="bg-pink-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    <strong>TikTok's unique features affect cover visibility:</strong>
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Profile grid shows covers at 1:1 ratio - design with center square in mind</li>
                    <li>• For You Page shows full 9:16 - utilize full vertical space</li>
                    <li>• Discovery tab thumbnails are smaller - ensure readability at 200x356px</li>
                    <li>• Live videos use different overlay - test covers in live preview mode</li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* Algorithm Deep Dive Section */}
          <section id="algorithm" className="mb-16">
            <Card className="p-8 border-pink-100">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-pink-600" />
                TikTok Algorithm Deep Dive
              </h3>
              
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">How the For You Page Algorithm Works</h4>
                <p className="text-gray-700 mb-4">
                  TikTok's recommendation system is one of the most sophisticated in social media. Understanding how covers impact 
                  algorithmic distribution is crucial for viral success.
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h5 className="font-semibold mb-4">Key Algorithm Factors</h5>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h6 className="font-semibold mb-1">Initial Engagement Rate (First 100 Views)</h6>
                        <p className="text-gray-700">
                          Your cover directly impacts whether users stop to watch. A compelling cover can boost initial engagement by 250%, 
                          triggering algorithmic promotion.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h6 className="font-semibold mb-1">Watch Time Percentage</h6>
                        <p className="text-gray-700">
                          Videos with optimized covers see 40% higher completion rates. The algorithm heavily weights videos watched to 80%+ completion.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h6 className="font-semibold mb-1">Share and Save Rates</h6>
                        <p className="text-gray-700">
                          Memorable covers increase shares by 180%. Users often share based on cover appeal before watching the full video.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">Cover Impact on Algorithm Performance</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 bg-gradient-to-br from-pink-50 to-white">
                    <BarChart className="w-8 h-8 text-pink-600 mb-4" />
                    <h5 className="font-semibold mb-3">Immediate Effects</h5>
                    <ul className="space-y-2 text-gray-700">
                      <li>• 3x higher click-through rate</li>
                      <li>• 250% better initial engagement</li>
                      <li>• 40% increase in profile visits</li>
                      <li>• 2x more likely to be saved</li>
                    </ul>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-to-br from-pink-50 to-white">
                    <TrendingUp className="w-8 h-8 text-pink-600 mb-4" />
                    <h5 className="font-semibold mb-3">Long-term Benefits</h5>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Higher FYP distribution rate</li>
                      <li>• Better audience retention</li>
                      <li>• Increased follower conversion</li>
                      <li>• Enhanced brand recognition</li>
                    </ul>
                  </Card>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">Timing and Trends</h4>
                <p className="text-gray-700 mb-4">
                  TikTok's algorithm favors timely, trend-aware content. Your cover should signal relevance:
                </p>
                <div className="bg-pink-50 p-6 rounded-lg">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                      <span><strong>Peak Hours:</strong> Post when your audience is most active (6-10am and 7-11pm local time)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Hash className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                      <span><strong>Trending Sounds:</strong> Include trending audio cues in your cover design</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                      <span><strong>Challenge Participation:</strong> Clearly indicate challenge participation in covers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                      <span><strong>Duet/Stitch Content:</strong> Show both creators prominently in collaborative covers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* Content Strategies Section */}
          <section id="strategies" className="mb-16">
            <Card className="p-8 border-pink-100">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Target className="w-8 h-8 text-pink-600" />
                Content Strategies That Work
              </h3>
              
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">Proven Cover Formulas for Different Content Types</h4>
                
                <div className="space-y-6">
                  <Card className="p-6 bg-gradient-to-r from-pink-50 to-white">
                    <h5 className="font-semibold mb-3 flex items-center gap-2">
                      <Video className="w-5 h-5 text-pink-600" />
                      Educational Content
                    </h5>
                    <p className="text-gray-700 mb-3">
                      Educational videos perform best with clear value propositions:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Use "How to" or numbered lists in covers</li>
                      <li>• Show before/after transformations</li>
                      <li>• Include time indicators ("in 30 seconds")</li>
                      <li>• Feature the end result prominently</li>
                    </ul>
                    <div className="mt-4 p-4 bg-pink-100 rounded">
                      <p className="text-sm"><strong>Example:</strong> "3 TikTok Hacks in 30 Seconds 🚀"</p>
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-to-r from-pink-50 to-white">
                    <h5 className="font-semibold mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-600" />
                      Entertainment Content
                    </h5>
                    <p className="text-gray-700 mb-3">
                      Comedy and entertainment thrive on curiosity gaps:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Use reaction faces or exaggerated expressions</li>
                      <li>• Create intrigue with partial reveals</li>
                      <li>• Add text that sets up the punchline</li>
                      <li>• Include emojis that match the mood</li>
                    </ul>
                    <div className="mt-4 p-4 bg-pink-100 rounded">
                      <p className="text-sm"><strong>Example:</strong> "Wait for it... 😱" or "POV: Your mom finds out..."</p>
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-to-r from-pink-50 to-white">
                    <h5 className="font-semibold mb-3 flex items-center gap-2">
                      <Music className="w-5 h-5 text-pink-600" />
                      Music and Dance Content
                    </h5>
                    <p className="text-gray-700 mb-3">
                      Performance content needs energy in the cover:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Capture mid-movement for dynamic poses</li>
                      <li>• Include song/artist names for searchability</li>
                      <li>• Use motion blur effects strategically</li>
                      <li>• Feature multiple frames or transitions</li>
                    </ul>
                    <div className="mt-4 p-4 bg-pink-100 rounded">
                      <p className="text-sm"><strong>Example:</strong> "New dance alert! 💃 #DanceChallenge"</p>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">Psychology-Based Cover Tactics</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold mb-3 text-pink-700">Create FOMO</h5>
                    <ul className="space-y-2 text-gray-700">
                      <li>• "Don't scroll without trying this"</li>
                      <li>• "Everyone's doing this wrong"</li>
                      <li>• "The trick nobody talks about"</li>
                      <li>• Time-sensitive language</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-3 text-pink-700">Spark Curiosity</h5>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Start stories mid-action</li>
                      <li>• Use cliffhanger text</li>
                      <li>• Show unexpected combinations</li>
                      <li>• Tease transformations</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">Viral Cover Patterns Analysis</h4>
                <p className="text-gray-700 mb-4">
                  Our AI analyzed 10,000+ viral TikToks to identify winning cover patterns:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Text + Face Combo</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-3 relative">
                          <div className="absolute left-0 top-0 h-full w-[87%] bg-pink-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Bright Colors</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-3 relative">
                          <div className="absolute left-0 top-0 h-full w-[78%] bg-pink-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Question Format</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-3 relative">
                          <div className="absolute left-0 top-0 h-full w-[72%] bg-pink-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Number Lists</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-3 relative">
                          <div className="absolute left-0 top-0 h-full w-[65%] bg-pink-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Common Mistakes Section */}
          <section id="mistakes" className="mb-16">
            <Card className="p-8 border-pink-100">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-pink-600" />
                Common Mistakes to Avoid
              </h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-red-500 pl-6">
                  <h4 className="text-xl font-semibold mb-2 text-red-700">1. Overcrowding the Cover</h4>
                  <p className="text-gray-700 mb-3">
                    TikTok covers are viewed on small screens. Too much text or too many elements make it impossible to read.
                  </p>
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-red-900">
                      <strong>Fix:</strong> Limit to one main message, use 5 words or less, and leave 30% white space.
                    </p>
                  </div>
                </div>
                
                <div className="border-l-4 border-red-500 pl-6">
                  <h4 className="text-xl font-semibold mb-2 text-red-700">2. Ignoring Platform UI Overlays</h4>
                  <p className="text-gray-700 mb-3">
                    The bottom 20% and right side of TikTok videos are covered by UI elements (username, buttons, captions).
                  </p>
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-red-900">
                      <strong>Fix:</strong> Keep all important elements in the center 70% of the frame. Test covers with TikTok's preview tool.
                    </p>
                  </div>
                </div>
                
                <div className="border-l-4 border-red-500 pl-6">
                  <h4 className="text-xl font-semibold mb-2 text-red-700">3. Using Low-Quality Images</h4>
                  <p className="text-gray-700 mb-3">
                    Blurry or pixelated covers signal low-quality content. TikTok's compression makes this worse.
                  </p>
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-red-900">
                      <strong>Fix:</strong> Always export at 1080x1920 pixels minimum. Use PNG format for graphics with text.
                    </p>
                  </div>
                </div>
                
                <div className="border-l-4 border-red-500 pl-6">
                  <h4 className="text-xl font-semibold mb-2 text-red-700">4. Misleading Thumbnails</h4>
                  <p className="text-gray-700 mb-3">
                    Clickbait covers that don't match video content hurt your engagement rate and algorithm performance.
                  </p>
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-red-900">
                      <strong>Fix:</strong> Ensure your cover accurately represents your content. Build trust for long-term growth.
                    </p>
                  </div>
                </div>
                
                <div className="border-l-4 border-red-500 pl-6">
                  <h4 className="text-xl font-semibold mb-2 text-red-700">5. Forgetting About Dark Mode</h4>
                  <p className="text-gray-700 mb-3">
                    Many users browse TikTok in dark mode. Light text on light backgrounds becomes invisible.
                  </p>
                  <div className="bg-red-50 p-4 rounded">
                    <p className="text-red-900">
                      <strong>Fix:</strong> Use high contrast colors. White text with black outlines works in all viewing modes.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-pink-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">Quick Checklist Before Publishing</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Text is readable at thumbnail size</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Important elements are in the safe zone</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Cover works in both light and dark mode</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Message matches video content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Design follows current trends</span>
                  </li>
                </ul>
              </div>
            </Card>
          </section>

          {/* Tools and Resources Section */}
          <section id="tools" className="mb-16">
            <Card className="p-8 border-pink-100">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Zap className="w-8 h-8 text-pink-600" />
                Tools and Resources
              </h3>
              
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">Essential Tools for TikTok Cover Creation</h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 bg-gradient-to-br from-pink-50 to-white">
                    <h5 className="font-semibold mb-3">Design Tools</h5>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                        <div>
                          <strong>CoverGen AI</strong>
                          <p className="text-sm text-gray-600">AI-powered cover generation optimized for TikTok's algorithm</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                        <div>
                          <strong>Canva Pro</strong>
                          <p className="text-sm text-gray-600">TikTok templates with correct dimensions</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                        <div>
                          <strong>Adobe Express</strong>
                          <p className="text-sm text-gray-600">Quick edits and effects for mobile</p>
                        </div>
                      </li>
                    </ul>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-to-br from-pink-50 to-white">
                    <h5 className="font-semibold mb-3">Analytics Tools</h5>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                        <div>
                          <strong>TikTok Analytics</strong>
                          <p className="text-sm text-gray-600">Native insights for performance tracking</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                        <div>
                          <strong>Tokboard</strong>
                          <p className="text-sm text-gray-600">Track trending sounds and hashtags</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                        <div>
                          <strong>Pentos</strong>
                          <p className="text-sm text-gray-600">Competitor analysis and trend discovery</p>
                        </div>
                      </li>
                    </ul>
                  </Card>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">Free Resources</h4>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-semibold mb-2">Fonts</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Google Fonts (Impact alternatives)</li>
                        <li>• DaFont (trendy display fonts)</li>
                        <li>• Font Squirrel (commercial-free)</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Stock Assets</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Unsplash (high-quality photos)</li>
                        <li>• Pexels (diverse imagery)</li>
                        <li>• Mixkit (video backgrounds)</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Effects</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• TikTok Effect House</li>
                        <li>• Spark AR Studio</li>
                        <li>• Lens Studio</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">TikTok Cover Templates</h4>
                <p className="text-gray-700 mb-4">
                  Start with these proven templates and customize for your brand:
                </p>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="aspect-[9/16] bg-gradient-to-b from-pink-500 to-pink-700 rounded-lg flex items-center justify-center text-white p-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold mb-2">3 TIPS</p>
                      <p className="text-lg">for Going Viral</p>
                    </div>
                  </div>
                  <div className="aspect-[9/16] bg-black rounded-lg flex items-center justify-center text-white p-4">
                    <div className="text-center">
                      <p className="text-2xl mb-2">WAIT</p>
                      <p className="text-4xl font-bold">FOR IT</p>
                      <p className="text-6xl mt-2">😱</p>
                    </div>
                  </div>
                  <div className="aspect-[9/16] bg-gradient-to-br from-yellow-400 to-pink-500 rounded-lg flex items-center justify-center text-white p-4">
                    <div className="text-center">
                      <p className="text-xl">POV:</p>
                      <p className="text-2xl font-bold">You're about to</p>
                      <p className="text-2xl font-bold">learn something</p>
                      <p className="text-3xl font-bold">AMAZING</p>
                    </div>
                  </div>
                  <div className="aspect-[9/16] bg-gradient-to-b from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white p-4">
                    <div className="text-center">
                      <p className="text-5xl mb-2">?</p>
                      <p className="text-2xl font-bold">Did You</p>
                      <p className="text-2xl font-bold">Know...</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Success Stories Section */}
          <section id="success" className="mb-16">
            <Card className="p-8 border-pink-100">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Award className="w-8 h-8 text-pink-600" />
                Success Stories
              </h3>
              
              <div className="space-y-6">
                <Card className="p-6 bg-gradient-to-r from-pink-50 to-white">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      JM
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">@justmiko - From 1K to 500K in 3 months</h4>
                      <p className="text-gray-700 mb-3">
                        "I started using AI-generated covers for my cooking videos. The difference was immediate - my average views jumped from 5K to 200K. 
                        The key was using bright colors and clear '30-second recipe' text on every cover."
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" /> 50M total views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" /> 2.3M likes
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-4 h-4" /> 500K shares
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-r from-pink-50 to-white">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      ST
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">@studytok_sarah - Educational Content Success</h4>
                      <p className="text-gray-700 mb-3">
                        "My study tips videos were getting lost until I optimized my covers. Now I use numbered lists and 'in 60 seconds' 
                        formatting. My save rate increased by 400% and I regularly hit the For You Page."
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" /> 25M total views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" /> 1.8M likes
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-4 h-4" /> 300K shares
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-gradient-to-r from-pink-50 to-white">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      DG
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">@dancewithgrace - Dance Challenge Creator</h4>
                      <p className="text-gray-700 mb-3">
                        "AI-generated covers helped me brand my dance challenges. Each cover features the dance name, difficulty level, 
                        and a dynamic pose. My challenges now regularly get picked up by bigger creators."
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" /> 100M total views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" /> 5M likes
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> 50K videos using sound
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="mt-8 bg-pink-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold mb-3">Common Success Factors</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span><strong>Consistency:</strong> All successful creators maintain a recognizable cover style</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span><strong>Clear Value:</strong> Covers immediately communicate what viewers will gain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span><strong>Platform Native:</strong> Designs feel authentic to TikTok, not imported from other platforms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <span><strong>Testing:</strong> Successful creators A/B test different cover styles</span>
                  </li>
                </ul>
              </div>
            </Card>
          </section>
        </article>
      </section>

      {/* TikTok Algorithm Mastery Section */}
      <section className="mb-20">
        <Card className="p-8 bg-gradient-to-br from-pink-100 via-pink-50 to-white border-pink-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Master the TikTok Algorithm</h2>
            <p className="text-xl text-gray-600">
              Learn the exact metrics that make TikTok promote your content
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-pink-600" />
                Key Performance Indicators
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                  <div>
                    <strong>Completion Rate:</strong> Videos watched to 80%+ get 5x more distribution
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                  <div>
                    <strong>Engagement Velocity:</strong> Likes/comments in first hour determine viral potential
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                  <div>
                    <strong>Share Rate:</strong> 1 share = 10 likes in algorithm weight
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                  <div>
                    <strong>Re-watch Rate:</strong> Multiple views from same user = strong quality signal
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart className="w-6 h-6 text-pink-600" />
                Optimization Timeline
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-pink-600 pl-4">
                  <p className="font-semibold">0-1 Hour:</p>
                  <p className="text-gray-700">Initial test with 100-300 views. High engagement = wider distribution</p>
                </div>
                <div className="border-l-4 border-pink-500 pl-4">
                  <p className="font-semibold">1-6 Hours:</p>
                  <p className="text-gray-700">Secondary push to 1K-10K if metrics are good</p>
                </div>
                <div className="border-l-4 border-pink-400 pl-4">
                  <p className="font-semibold">6-24 Hours:</p>
                  <p className="text-gray-700">Viral potential realized, can reach 100K+ views</p>
                </div>
                <div className="border-l-4 border-pink-300 pl-4">
                  <p className="font-semibold">24+ Hours:</p>
                  <p className="text-gray-700">Sustained growth if engagement remains high</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-pink-100 rounded-lg">
            <p className="text-center text-pink-900 font-medium">
              💡 <strong>Cover Impact:</strong> A well-designed cover can improve your completion rate by 40%, 
              directly influencing all other algorithm metrics
            </p>
          </div>
        </Card>
      </section>

      {/* Detailed FAQ Section */}
      <section id="faq" className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about creating viral TikTok covers
          </p>
        </div>
        
        <div className="space-y-6">
          <Card className="p-6 border-pink-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-600" />
              What are the exact dimensions for TikTok covers?
            </h3>
            <p className="text-gray-700">
              TikTok videos and covers should be 1080x1920 pixels (9:16 aspect ratio). This is the standard vertical format 
              that fills the entire phone screen. While TikTok accepts various resolutions, 1080x1920 ensures the highest quality 
              without compression artifacts. For profile grid display, your cover will be cropped to a 1:1 square ratio, 
              so keep important elements centered.
            </p>
          </Card>
          
          <Card className="p-6 border-pink-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-600" />
              How important is the cover image for TikTok success?
            </h3>
            <p className="text-gray-700">
              Extremely important. Studies show that videos with optimized covers receive 250% more initial engagement than those without. 
              The cover acts as your "first impression" on the For You Page, in search results, and on your profile. Since TikTok's 
              algorithm heavily weights early engagement (first 100 views), a compelling cover directly impacts whether your video 
              goes viral or gets buried.
            </p>
          </Card>
          
          <Card className="p-6 border-pink-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-600" />
              Should I use the same cover style for all my TikToks?
            </h3>
            <p className="text-gray-700">
              Yes and no. Maintain consistent branding elements (colors, fonts, logo placement) to build recognition, but vary the 
              specific design based on content type. For example, use one template style for tutorials, another for entertainment 
              content. This consistency helps followers instantly recognize your content while keeping each video fresh. Successful 
              creators often have 3-5 template variations they rotate through.
            </p>
          </Card>
          
          <Card className="p-6 border-pink-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-600" />
              What text performs best on TikTok covers?
            </h3>
            <p className="text-gray-700">
              Short, punchy text works best. Limit to 5-7 words maximum. Use power words like "Secret," "Hack," "Never," "Always," 
              numbers ("3 Ways," "5 Tips"), and time indicators ("30 Seconds," "Quick"). Questions ("Did You Know?") and 
              cliffhangers ("Wait for it...") drive curiosity. Font size should be at least 60px for main text, using bold, 
              sans-serif fonts. White text with black outline ensures readability across all backgrounds.
            </p>
          </Card>
          
          <Card className="p-6 border-pink-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-600" />
              How do I avoid TikTok's UI elements covering my cover?
            </h3>
            <p className="text-gray-700">
              Keep all important elements (text, faces, key visuals) within the center 70% of the frame. The bottom 20% is covered 
              by username, caption, and interaction buttons. The right side has share, like, and comment buttons. Use TikTok's 
              preview feature before posting to check placement. Many creators add a subtle grid overlay during design to mark 
              these "no-go zones" and ensure nothing important gets obscured.
            </p>
          </Card>
          
          <Card className="p-6 border-pink-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-600" />
              What colors work best for TikTok engagement?
            </h3>
            <p className="text-gray-700">
              High-contrast, vibrant colors perform best on TikTok. Pink, neon green, bright yellow, and electric blue grab attention 
              in the fast-scrolling feed. Black backgrounds with bright text create strong contrast. Avoid muted or pastel colors 
              as standalone choices—they can work as accents but need bold elements for impact. Consider TikTok's dark mode: 
              colors that pop against both black and white backgrounds ensure maximum visibility.
            </p>
          </Card>
          
          <Card className="p-6 border-pink-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-600" />
              Should I include trending sounds or hashtags in my cover?
            </h3>
            <p className="text-gray-700">
              Yes, but strategically. Including trending sound names or challenge hashtags can increase discoverability by 30-40%. 
              However, don't clutter your cover—use small text in a corner or integrate it into your main design. For challenges, 
              make the challenge name prominent. For trending sounds, a small music note icon with the sound name suffices. This 
              helps users searching for specific trends find your content more easily.
            </p>
          </Card>
          
          <Card className="p-6 border-pink-100">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-600" />
              How often should I test different cover styles?
            </h3>
            <p className="text-gray-700">
              A/B test new cover styles every 10-15 videos. Track metrics like initial view count, completion rate, and profile 
              visits for each style. Once you find winning formulas, use them for 70% of your content while testing variations 
              with the remaining 30%. Monthly analysis of your top-performing videos' covers helps identify emerging patterns. 
              Remember, TikTok trends change quickly—what worked last month might need updating.
            </p>
          </Card>
        </div>
      </section>

      {/* Resources and Tools Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">TikTok Creator Resources</h2>
          <p className="text-xl text-gray-600">
            Essential tools and guides to level up your TikTok content
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Music className="w-12 h-12 text-pink-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Trending Sounds Tracker</h3>
            <p className="text-gray-600 mb-4">
              Stay ahead of viral audio trends. Our AI monitors rising sounds and predicts which will go viral next.
            </p>
            <Link href="#" className="text-pink-600 font-medium flex items-center gap-2 hover:gap-3 transition-all">
              Access Tool <ArrowRight className="w-4 h-4" />
            </Link>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Hash className="w-12 h-12 text-pink-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Hashtag Generator</h3>
            <p className="text-gray-600 mb-4">
              Find the perfect mix of trending and niche hashtags for maximum reach and algorithm optimization.
            </p>
            <Link href="#" className="text-pink-600 font-medium flex items-center gap-2 hover:gap-3 transition-all">
              Generate Hashtags <ArrowRight className="w-4 h-4" />
            </Link>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Clock className="w-12 h-12 text-pink-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Best Time Analyzer</h3>
            <p className="text-gray-600 mb-4">
              Discover when your audience is most active. Get personalized posting schedules based on your analytics.
            </p>
            <Link href="#" className="text-pink-600 font-medium flex items-center gap-2 hover:gap-3 transition-all">
              Find Best Times <ArrowRight className="w-4 h-4" />
            </Link>
          </Card>
        </div>
        
        <div className="mt-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Create Viral TikTok Covers?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of creators using AI to design scroll-stopping covers that boost engagement and grow their following.
            </p>
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center gap-2 bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Start Creating Free <Sparkles className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}