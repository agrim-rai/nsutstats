'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit, Trash2, Eye, Plus, Calendar, Clock } from 'lucide-react'
import { Post } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ username: string; role?: string } | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    setUser(JSON.parse(userData))
    fetchUserPosts()
  }, [router])

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
      
      const response = await fetch('/api/user/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError(error instanceof Error ? error.message : 'Failed to fetch posts')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      // Remove the post from the list
      setPosts(posts.filter(post => post._id !== postId))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete post')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NSUT Stats Dashboard</h1>
            <p className="text-gray-600 mt-2">
              {user.role === 'admin' ? 'Manage all blog posts' : 'Manage your blog posts'}
            </p>
          </div>
          <Link
            href="/create"
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Post</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {user.role === 'admin' ? 'No posts found' : 'No posts yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {user.role === 'admin' ? 'There are no blog posts in the system yet.' : 'Start writing your first blog post!'}
          </p>
          <Link
            href="/create"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>{user.role === 'admin' ? 'Create New Post' : 'Create Your First Post'}</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {user.role === 'admin' ? 'All Posts' : 'Your Posts'} ({posts.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        <Link href={`/posts/${post._id}`} className="hover:text-blue-600">
                          {post.title}
                        </Link>
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime} min read</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views} views</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {post.category}
                      </span>
                      {post.tags && post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags && post.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{post.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/posts/${post._id}`}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      title="View post"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/posts/${post._id}/edit`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Edit post"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
