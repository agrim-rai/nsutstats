'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Calendar, Clock, User } from 'lucide-react'
import { Post } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useLoading } from '@/lib/useLoading'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  
  const { loading, error, withLoading } = useLoading({ minLoadingTime: 300 })

  const fetchPosts = useCallback(async () => {
    // Add timeout to prevent long loading times
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(`/api/posts`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }
    
    const data = await response.json()
    setPosts(data.posts || [])
  }, [])

  useEffect(() => {
    // Fetch data in parallel for better performance using the loading hook
    const fetchData = async () => {
      await withLoading(async () => {
        await fetchPosts()
      })
    }
    
    fetchData()
  }, [fetchPosts, withLoading])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return <LoadingSpinner text="Loading articles..." />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Announcement Banner */}
      <div className="mb-8">
        <div className="rounded-lg border bg-white p-4 md:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm md:text-base text-gray-800 font-medium">
                Calling all data analytics enthusiasts — learn and build with NSUT Stats.
              </p>
              <p className="text-sm text-gray-600">
                Collaborate on insightful posts, grow your skills, and contribute to our community.
              </p>
            </div>
            <div className="shrink-0">
              <a
                href="mailto:agrimforworld@gmail.com"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white-900 mb-4">
          Welcome to NSUT Stats
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Your premier destination for comprehensive ML data analysis, statistical insights, and data-driven research. 
          We publish cutting-edge statistics and analytical content to empower your understanding of data science.
        </p>
        
      </div>

      {/* Filters removed */}

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-white-900 mb-2">No articles found</h3>
          <p className="text-gray-600">Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post._id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              {post.featuredImage && (
                <div className="aspect-video bg-gray-200">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {post.category}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  <Link href={`/posts/${post._id}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author?.username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
