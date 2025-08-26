'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Upload, File, Image, Code, Trash2 } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'
import { uploadImageToS3 } from '@/lib/imageUpload'

interface Attachment {
  fileName: string
  originalName: string
  fileUrl: string
  fileSize: number
  fileType: string
}

export default function CreatePost() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    richContent: '',
    category: '',
    tags: [] as string[],
    featuredImage: '',
    status: 'published' as 'draft' | 'published',
    attachments: [] as Attachment[]
  })
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    const userObj = JSON.parse(userData)
    // Allow both admins and regular users to create posts
    setUser(userObj)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      // Extract plain text content from rich content for excerpt
      let excerpt = ''
      if (formData.richContent) {
        try {
          const richContent = JSON.parse(formData.richContent)
          excerpt = extractTextFromRichContent(richContent)
        } catch (error) {
          excerpt = formData.content
        }
      } else {
        excerpt = formData.content
      }

      // Client-side validation for content length
      if (excerpt.trim().length < 10) {
        setError('Content must be at least 10 characters long. Currently: ' + excerpt.trim().length + ' characters.')
        setLoading(false)
        return
      }

      // Validation for required fields
      if (!formData.title.trim()) {
        setError('Title is required.')
        setLoading(false)
        return
      }

      if (!formData.category.trim()) {
        setError('Category is required.')
        setLoading(false)
        return
      }

      const postData = {
        ...formData,
        content: excerpt, // Use extracted text as content
        excerpt: excerpt.substring(0, 200) + (excerpt.length > 200 ? '...' : ''),
        readTime: Math.ceil(excerpt.split(/\s+/).length / 200) // Word count divided by 200 words per minute
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post')
      }

      // Redirect to the new post
      router.push(`/posts/${data.post._id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      })
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload file')
        }

        // Add file to attachments
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, data.file]
        }))
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const removeAttachment = (fileName: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.fileName !== fileName)
    }))
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (fileType.includes('text') || fileType.includes('javascript') || fileType.includes('css')) return <Code className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Helper function to extract plain text from rich content
  const extractTextFromRichContent = (richContent: any): string => {
    if (!richContent || typeof richContent !== 'object') return ''
    
    let text = ''
    
    const extractFromNode = (node: any) => {
      if (typeof node === 'string') {
        text += node
        return
      }
      
      if (node.type === 'text' && node.text) {
        text += node.text
      }
      
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(extractFromNode)
      }
      
      // Handle paragraph breaks and other block elements
      if (node.type === 'paragraph' || node.type === 'heading') {
        text += ' '
      }
    }
    
    extractFromNode(richContent)
    return text.trim()
  }

  // Handle rich content changes
  const handleRichContentChange = (richContent: string) => {
    let extractedText = ''
    try {
      const parsed = JSON.parse(richContent)
      extractedText = extractTextFromRichContent(parsed)
    } catch (error) {
      console.error('Error parsing rich content:', error)
      extractedText = ''
    }
    
    setFormData(prev => ({
      ...prev,
      richContent,
      content: extractedText
    }))
  }

  // Handle image upload for rich editor
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const url = await uploadImageToS3(file)
      return url
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload image')
      throw error
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white-900">Create New Analysis</h1>
        <p className="text-gray-600 mt-2">Publish new statistical analysis or ML content</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your post title"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., Technology, Lifestyle, Travel"
            />
          </div>
        </div>

        <div>
          <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image URL
          </label>
          <input
            type="url"
            id="featuredImage"
            name="featuredImage"
            value={formData.featuredImage}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <RichTextEditor
            content={formData.richContent}
            onChange={handleRichContentChange}
            onImageUpload={handleImageUpload}
            placeholder="Write your post content here... You can format text, add images, and insert code blocks."
            className="min-h-[400px]"
          />
          <div className="mt-2 text-sm text-gray-500">
            Content length: {formData.content.length} characters 
            {formData.content.length < 10 && (
              <span className="text-red-500 ml-2">
                (Minimum 10 characters required)
              </span>
            )}
            {formData.content.length >= 10 && (
              <span className="text-green-500 ml-2">✓</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Attachments
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept="image/*,.txt,.md,.html,.pdf,.json,.js,.css,.xml"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Click to upload files or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Images, code files, documents up to 10MB
              </p>
            </label>
          </div>
          
          {formData.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
              {formData.attachments.map((attachment) => (
                <div key={attachment.fileName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(attachment.fileType)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attachment.originalName}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment.fileName)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="published">Publish immediately</option>
            <option value="draft">Save as draft</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
