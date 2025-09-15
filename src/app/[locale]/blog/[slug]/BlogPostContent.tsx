'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BlogPost, getRelatedPosts } from '@/data/blogPosts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Heart, 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin,
  Link2,
  Check,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/components/ui/use-toast'

interface BlogPostContentProps {
  post: BlogPost
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const pathname = usePathname()
  const { toast } = useToast()
  const [likes, setLikes] = useState(post.likes)
  const [hasLiked, setHasLiked] = useState(false)
  const [copied, setCopied] = useState(false)

  const relatedPosts = getRelatedPosts(post)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `Check out this article: ${post.title}`

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1)
      setHasLiked(true)
      toast({
        title: "Thanks for the love!",
        description: "Your like has been recorded.",
      })
    }
  }

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)
    
    let shareLink = ''
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
        break
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case 'copy':
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({
          title: "Link copied!",
          description: "The article link has been copied to your clipboard.",
        })
        return
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400')
    }
  }

  // Parse markdown-style content to HTML
  const renderContent = (content: string) => {
    // This is a simple markdown parser. In production, you'd use a library like markdown-it or remark
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let currentIndex = 0

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${currentIndex++}`} className="text-4xl font-bold mt-8 mb-4">
            {line.substring(2)}
          </h1>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${currentIndex++}`} className="text-3xl font-semibold mt-6 mb-3">
            {line.substring(3)}
          </h2>
        )
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${currentIndex++}`} className="text-2xl font-semibold mt-4 mb-2">
            {line.substring(4)}
          </h3>
        )
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <p key={`bold-${currentIndex++}`} className="font-semibold my-2">
            {line.substring(2, line.length - 2)}
          </p>
        )
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={`li-${currentIndex++}`} className="ml-6 my-1">
            {line.substring(2)}
          </li>
        )
      } else if (line.startsWith('1. ')) {
        elements.push(
          <li key={`ol-${currentIndex++}`} className="ml-6 my-1 list-decimal">
            {line.substring(3)}
          </li>
        )
      } else if (line.includes('|') && line.includes('-|-')) {
        // Simple table rendering
        elements.push(
          <div key={`table-${currentIndex++}`} className="overflow-x-auto my-4">
            <table className="min-w-full border">
              <tbody>
                <tr className="border-b">
                  {line.split('|').filter(cell => cell.trim()).map((cell, i) => (
                    <td key={i} className="px-4 py-2 border">{cell.trim()}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )
      } else if (line.trim() !== '') {
        elements.push(
          <p key={`p-${currentIndex++}`} className="my-3 text-gray-700 dark:text-gray-300 leading-relaxed">
            {line}
          </p>
        )
      }
    })

    return elements
  }

  return (
    <article className="min-h-screen bg-background">
      {/* Article Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
        <div className="container mx-auto px-4 py-12">
          <Link href="/en/blog" className="inline-flex items-center text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{post.readTime}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                  {post.authorRole && (
                    <>
                      <span>•</span>
                      <span>{post.authorRole}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.views.toLocaleString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={hasLiked ? 'text-red-500' : ''}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
                    {likes}
                  </Button>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleShare('twitter')}>
                      <Twitter className="w-4 h-4 mr-2" />
                      Share on Twitter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare('facebook')}>
                      <Facebook className="w-4 h-4 mr-2" />
                      Share on Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                      <Linkedin className="w-4 h-4 mr-2" />
                      Share on LinkedIn
                    </DropdownMenuItem>
                    <Separator className="my-1" />
                    <DropdownMenuItem onClick={() => handleShare('copy')}>
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy link'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1200}
                height={600}
                className="w-full h-auto"
                priority
              />
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Article Body */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {renderContent(post.content)}
          </div>

          {/* Author Info */}
          <Separator className="my-12" />
          <div className="flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {post.authorAvatar && (
              <Image
                src={post.authorAvatar}
                alt={post.author}
                width={80}
                height={80}
                className="rounded-full"
              />
            )}
            <div>
              <h3 className="font-semibold text-lg">{post.author}</h3>
              {post.authorRole && (
                <p className="text-muted-foreground">{post.authorRole}</p>
              )}
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <>
              <Separator className="my-12" />
              <div>
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2">
                          {relatedPost.category}
                        </Badge>
                        <CardTitle className="text-lg line-clamp-2">
                          {relatedPost.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{relatedPost.readTime}</span>
                          <Link 
                            href={`/en/blog/${relatedPost.slug}`}
                            className="text-primary hover:underline flex items-center"
                          >
                            Read more
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  )
}