'use client'

import { useState } from 'react'
import { ZoomIn, X, Download } from 'lucide-react'
import { Attachment } from '@/types'

interface ImageAttachmentProps {
  attachment: Attachment
  index: number
}

export default function ImageAttachment({ attachment, index }: ImageAttachmentProps) {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)



  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', attachment.fileUrl, e)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageError(false)
    setImageLoading(false)
  }

  const openFullScreen = () => {
    setIsFullScreen(true)
  }

  const closeFullScreen = () => {
    setIsFullScreen(false)
  }

  if (imageError) {
    // Fallback to regular file display if image fails to load
    return (
      <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="h-4 w-4 text-gray-400">📁</div>
          <div>
            <p className="text-white font-medium">{attachment.originalName}</p>
            <p className="text-slate-400 text-sm">{formatFileSize(attachment.fileSize)}</p>
          </div>
        </div>
        <a
          href={attachment.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </a>
      </div>
    )
  }

  return (
    <>
      {/* Image Preview Box */}
      <div className="relative group bg-slate-700 rounded-lg overflow-hidden border border-slate-600 hover:border-slate-500 transition-colors">
        <div className="aspect-video relative bg-slate-600 overflow-hidden">
          {/* Loading spinner */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-600">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Error state */}
          {imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-600">
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-sm text-center px-2">Image preview not available</p>
            </div>
          )}
          
          {/* Image */}
          <img
            src={attachment.fileUrl}
            alt={attachment.originalName}
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ 
              display: imageError ? 'none' : 'block',
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
          
          {/* Overlay with zoom icon - only show when image is loaded */}
          {!imageLoading && !imageError && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
              <button
                onClick={openFullScreen}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 bg-black bg-opacity-60 rounded-full hover:bg-opacity-80"
                title="View full size"
              >
                <ZoomIn className="h-6 w-6 text-white" />
              </button>
            </div>
          )}
        </div>
        
        {/* Image Info */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{attachment.originalName}</p>
              <p className="text-slate-400 text-sm">{formatFileSize(attachment.fileSize)}</p>
            </div>
            <a
              href={attachment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors"
              title="Download image"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        </div>
      </div>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeFullScreen}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-colors"
              title="Close full screen"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            
            {/* Download button */}
            <a
              href={attachment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 left-4 z-10 flex items-center space-x-2 px-3 py-2 bg-black bg-opacity-60 rounded hover:bg-opacity-80 transition-colors"
              title="Download image"
            >
              <Download className="h-4 w-4 text-white" />
              <span className="text-white text-sm">Download</span>
            </a>
            
            {/* Image */}
            <img
              src={attachment.fileUrl}
              alt={attachment.originalName}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Image info overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-60 rounded p-3">
              <p className="text-white font-medium">{attachment.originalName}</p>
              <p className="text-gray-300 text-sm">{formatFileSize(attachment.fileSize)}</p>
            </div>
          </div>
          
          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={closeFullScreen}
          />
        </div>
      )}
    </>
  )
}
