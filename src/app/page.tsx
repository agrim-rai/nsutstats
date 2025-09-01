'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Calendar, Clock, User } from 'lucide-react'
import { Post } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import SearchBar from '@/components/SearchBar'
import { useLoading } from '@/lib/useLoading'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Post[]>([])
  
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

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/posts?search=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      setSearchResults(data.posts || [])
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

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
        <div 
          className="border px-4 py-3 rounded-lg mb-6"
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: '#fca5a5'
          }}
        >
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Try Again
        </button>
      </div>
    )
  }

  const displayPosts = searchQuery ? searchResults : posts

  return (
    <div className="max-w-6xl mx-auto">
      {/* Announcement Banner */}
      <div className="mb-8">
        <div 
          className="rounded-xl p-4 md:p-6 shadow-lg backdrop-blur-sm border"
          style={{ 
            background: 'var(--background-card)', 
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm md:text-base text-slate-100 font-medium">
                Calling all data analytics enthusiasts — learn and build with NSUT Stats.
              </p>
              <p className="text-sm text-slate-300">
                Collaborate on insightful posts, grow your skills, and contribute to our community.
              </p>
            </div>
            <div className="shrink-0">
              <a
                href="mailto:agrimforworld@gmail.com"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
          Welcome to NSUT Stats
        </h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
          Your premier destination for comprehensive ML data analysis, statistical insights, and data-driven research. 
          We publish cutting-edge statistics and analytical content to empower your understanding of data science.
        </p>
        
        {/* Search Bar */}
        <SearchBar 
          onSearch={handleSearch}
          isSearching={isSearching}
          className="mb-8"
        />
        
        {/* Search Results Info */}
        {searchQuery && (
          <div className="text-center mb-6">
            <p className="text-slate-300">
              {isSearching ? (
                'Searching...'
              ) : searchResults.length > 0 ? (
                `Found ${searchResults.length} article${searchResults.length === 1 ? '' : 's'} for "${searchQuery}"`
              ) : (
                `No articles found for "${searchQuery}"`
              )}
            </p>
            {!isSearching && (
              <button
                onClick={() => handleSearch('')}
                className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 underline transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filters removed */}

      {/* Posts Grid */}
      {displayPosts.length === 0 && !loading ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-slate-100 mb-2">
            {searchQuery ? `No articles found for "${searchQuery}"` : 'No articles found'}
          </h3>
          <p className="text-slate-400">
            {searchQuery ? 'Try a different search term.' : 'Please check back later.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map((post) => (
            <article 
              key={post._id} 
              className="rounded-xl overflow-hidden border hover:shadow-xl transition-all duration-300 group"
              style={{ 
                background: 'var(--background-card)', 
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {post.featuredImage && (
                <div className="aspect-video bg-slate-700 relative overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 text-xs font-medium rounded-full border border-indigo-500/30">
                    {post.category}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-slate-100 mb-3 line-clamp-2">
                  <Link href={`/posts/${post.slug}`} className="hover:text-indigo-400 transition-colors">
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-slate-300 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4 text-cyan-400" />
                      <span>{post.author?.username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-cyan-400" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full border border-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full border border-slate-600">
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
