'use client'

import { Download, File, Code, Archive } from 'lucide-react'
import { Attachment } from '@/types'

interface FileAttachmentProps {
  attachment: Attachment
  index: number
}

export default function FileAttachment({ attachment, index }: FileAttachmentProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <File className="h-4 w-4 text-red-400" />
    if (fileType.includes('code') || fileType.includes('text')) return <Code className="h-4 w-4 text-green-400" />
    if (fileType.includes('archive') || fileType.includes('zip')) return <Archive className="h-4 w-4 text-yellow-400" />
    if (fileType.includes('word') || fileType.includes('document')) return <File className="h-4 w-4 text-blue-400" />
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <File className="h-4 w-4 text-green-400" />
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return <File className="h-4 w-4 text-orange-400" />
    return <File className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
      <div className="flex items-center space-x-3">
        {getFileIcon(attachment.fileType)}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{attachment.originalName}</p>
          <p className="text-slate-400 text-sm">{formatFileSize(attachment.fileSize)}</p>
        </div>
      </div>
      <a
        href={attachment.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
        title={`Download ${attachment.originalName}`}
      >
        <Download className="h-4 w-4" />
        <span>Download</span>
      </a>
    </div>
  )
}
