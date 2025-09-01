'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, User, Eye, MessageCircle, Edit, Trash2, Send, File, Image, X } from 'lucide-react'
import { Post, Comment } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import RichContentRenderer from '@/components/RichContentRenderer'
import ImageAttachment from '@/components/ImageAttachment'
import FileAttachment from '@/components/FileAttachment'

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [user, setUser] = useState<{ username: string; role?: string } | null>(null)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const fetchPost = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true)
      setError('')
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
      
      const response = await fetch(`/api/posts/slug/${params.slug}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      clearTimeout(timeoutId)
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Post not found')
      }
      
      setPost(data.post)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        if (retryCount < 2) {
          // Retry once more with a longer timeout
          setTimeout(() => fetchPost(retryCount + 1), 1000)
          return
        }
        setError('Request timed out. Please try again.')
      } else {
        setError(error instanceof Error ? error.message : 'Failed to load post')
      }
    } finally {
      setLoading(false)
    }
  }, [params.slug])

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/slug/${params.slug}/comments`)
      const data = await response.json()
      
      if (response.ok) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }, [params.slug])

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    try {
      const response = await fetch('/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }, [])

  useEffect(() => {
    fetchPost()
    fetchComments()
    fetchUser()
  }, [fetchPost, fetchComments, fetchUser])

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    const token = localStorage.getItem('token')
    if (!token) {
      alert('You need to be logged in to delete posts')
      return
    }
    
    try {
      const response = await fetch(`/api/posts/slug/${params.slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('Post deleted successfully')
        router.push('/dashboard')
      } else {
        alert(data.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete post')
    }
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!commentContent.trim()) return
    
    const token = localStorage.getItem('token')
    if (!token) {
      alert('You need to be logged in to comment')
      return
    }
    
    setSubmittingComment(true)
    
    try {
      const response = await fetch(`/api/posts/slug/${params.slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentContent })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCommentContent('')
        fetchComments() // Refresh comments
      } else {
        alert(data.error || 'Failed to submit comment')
      }
    } catch (error) {
      console.error('Comment error:', error)
      alert('Failed to submit comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }



  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => fetchPost()} 
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
            >
              Try Again
            </button>
            <Link 
              href="/" 
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-slate-300 mb-6">The post you're looking for doesn't exist.</p>
          <Link 
            href="/" 
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Post Header */}
          <div className="bg-slate-800 rounded-lg p-8 mb-8 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 text-sm font-medium rounded-full border border-indigo-500/30">
                  {post.category}
                </span>
                {post.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
              
              {user && user.role === 'admin' && (
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/posts/${post.slug}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-slate-700 rounded-md transition-colors"
                    title="Edit post"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={handleDeletePost}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded-md transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-6">
              {post.title}
            </h1>
            
            <div className="flex items-center space-x-6 text-slate-400 mb-6">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-cyan-400" />
                <span>{post.author.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span>{post.readTime} min read</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                <span>{post.views} views</span>
              </div>
            </div>
            
            {post.featuredImage && (
              <div className="mb-6">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(post.featuredImage || null)}
                />
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="bg-slate-800 rounded-lg p-8 mb-8 border border-slate-700">
            <div className="prose prose-invert prose-slate max-w-none">
              {post.richContent ? (
                <RichContentRenderer content={post.richContent} />
              ) : (
                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </div>
              )}
            </div>
            
            {/* Attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <File className="h-5 w-5 mr-2 text-cyan-400" />
                  Attachments ({post.attachments.length})
                </h3>
                
                {/* Separate images and other files */}
                {(() => {
                  const images = post.attachments.filter(att => att.fileType.startsWith('image/'))
                  const otherFiles = post.attachments.filter(att => !att.fileType.startsWith('image/'))
                  
                  return (
                    <div className="space-y-6">
                      {/* Image Attachments */}
                      {images.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium text-slate-300 mb-4 flex items-center">
                            <Image className="h-4 w-4 mr-2 text-cyan-400" />
                            Images ({images.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {images.map((attachment, index) => (
                              <ImageAttachment
                                key={`image-${index}`}
                                attachment={attachment}
                                index={index}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Other File Attachments */}
                      {otherFiles.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium text-slate-300 mb-4 flex items-center">
                            <File className="h-4 w-4 mr-2 text-cyan-400" />
                            Files ({otherFiles.length})
                          </h4>
                          <div className="grid gap-3">
                            {otherFiles.map((attachment, index) => (
                              <FileAttachment
                                key={`file-${index}`}
                                attachment={attachment}
                                index={index}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-cyan-400" />
              Comments ({comments.length})
            </h2>
            
            {/* Comment Form */}
            {user ? (
              <form onSubmit={submitComment} className="mb-8">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={submittingComment || !commentContent.trim()}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submittingComment ? 'Submitting...' : 'Post Comment'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-8 p-4 bg-slate-700 rounded-lg border border-slate-600">
                <p className="text-slate-300 text-center">
                  Please{' '}
                  <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                    log in
                  </Link>{' '}
                  to post a comment.
                </p>
              </div>
            )}
            
            {/* Comments List */}
            <div className="space-y-6">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="bg-slate-700 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {comment.author.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{comment.author.username}</p>
                        <p className="text-slate-400 text-sm">{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
