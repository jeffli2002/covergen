'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Eye, Heart, Share2, ArrowRight } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

export default function BlogPage() {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleLike = (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    if (likedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
  };

  const handleShare = (platform: string, post: typeof blogPosts[0]) => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    const text = post.title;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Blog post link has been copied to clipboard.",
        });
        break;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'white' }}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-hero-title bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Our Blog
          </h1>
          <p className="text-body-lg text-gray-700 max-w-2xl mx-auto">
            Discover the latest insights, tips, and strategies for content creation across all platforms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article
              key={post.id}
              className="bg-gray-50 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200"
            >
              <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 relative">
                {/* Placeholder for blog post image */}
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <h3 className="text-white text-heading-4 text-center px-4">
                    {post.title}
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-heading-5 text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-gray-700 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readingTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.viewCount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        likedPosts.has(post.id)
                          ? 'text-red-500'
                          : 'text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`}
                      />
                      {post.likeCount + (likedPosts.has(post.id) ? 1 : 0)}
                    </button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleShare('twitter', post)}>
                          Share on Twitter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('facebook', post)}>
                          Share on Facebook
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('linkedin', post)}>
                          Share on LinkedIn
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('copy', post)}>
                          Copy Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {post.author.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {post.author.title}
                      </p>
                    </div>
                  </div>
                  
                  <Link href={`/en/blog/${post.slug}`} className="ml-auto">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="group bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Read More 
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}