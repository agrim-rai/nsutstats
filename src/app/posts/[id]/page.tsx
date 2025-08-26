'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, User, Eye, MessageCircle, Edit, Trash2, Send, File, Image, Code, Download, ExternalLink } from 'lucide-react'
import { Post, Comment } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import RichContentRenderer from '@/components/RichContentRenderer'

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

  const fetchPost = useCallback(async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
      
      const response = await fetch(`/api/posts/${params.id}`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Post not found')
      }
      
      setPost(data.post)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError(error instanceof Error ? error.message : 'Failed to load post')
      }
    } finally {
      setLoading(false)
    }
  }, [params.id])

  const fetchComments = useCallback(async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch(`/api/posts/${params.id}/comments`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }, [params.id])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchPost()
    fetchComments()
  }, [fetchPost, fetchComments])



  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    if (!commentContent.trim()) return

    setSubmittingComment(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentContent }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment')
      }

      setCommentContent('')
      fetchComments() // Refresh comments
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to post comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      router.push('/')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete post')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5" />
    if (fileType.includes('text') || fileType.includes('javascript') || fileType.includes('css')) return <Code className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return <LoadingSpinner text="Loading article..." />
  }

  if (error || !post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/" className="text-blue-600 hover:text-blue-500">
          ← Back to Home
        </Link>
      </div>
    )
  }

  const isAdmin = user && user.role === 'admin'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Post Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {post.category}
            </span>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} min read</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Eye className="h-4 w-4" />
              <span>{post.views} views</span>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex items-center space-x-3">
              <Link
                href={`/posts/${post._id}/edit`}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
              <button
                onClick={handleDeletePost}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700 font-medium">{post.author.username}</span>
          </div>
        </div>

        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-80 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-12">
        {post.richContent ? (
          <RichContentRenderer content={post.richContent} />
        ) : (
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed text-gray-800">{post.content}</div>
          </div>
        )}
      </div>

      {/* File Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-12 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <File className="h-5 w-5 mr-2" />
            Attachments ({post.attachments.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {post.attachments.map((attachment) => (
              <div key={attachment.fileName} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  {getFileIcon(attachment.fileType)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attachment.originalName}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View file"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={attachment.fileUrl}
                    download={attachment.originalName}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="border-t pt-8">
        <div className="flex items-center space-x-2 mb-6">
          <MessageCircle className="h-5 w-5" />
          <h2 className="text-2xl font-bold text-gray-900">
            Comments ({comments.length})
          </h2>
        </div>

        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex gap-4">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
              <button
                type="submit"
                disabled={submittingComment || !commentContent.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed self-end transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Please{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                sign in
              </Link>{' '}
              to leave a comment.
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {comment.author.username}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
